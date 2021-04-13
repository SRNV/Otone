import { O3Document } from '../types/definition';
import {
  createConnection,
  TextDocuments,
  Diagnostic,
  DiagnosticSeverity,
  ProposedFeatures,
  InitializeParams,
  DidChangeConfigurationNotification,
  CompletionItem,
  CompletionItemKind,
  TextDocumentPositionParams,
  TextDocumentSyncKind,
  InitializeResult
} from 'vscode-languageserver';
import * as urlencode from 'urlencode';
export default class Collections {
  protected collection: Map<string, O3Document> = new Map();
  protected connection: ReturnType<typeof createConnection>;
  protected diagnostics: Diagnostic[] = [];
  protected cancelledNode: string[] = ['proto', 'script', 'style'];
  public readonly supportedTypes: string[] = [
    "component",
    "async",
    "controller",
    "store",
    "app",
    "router",
  ];
  public readonly validProtocolAttributes: string[] = ['def', 'type', 'engine', 'namespace', 'base'];
  public readonly validTemplateAttributes: string[] = ['is', 'private', 'protected'];
  public readonly validStyleAttributes: string[] = ['--keyframes', 'name', 'global'];

  setConnection(connection: ReturnType<typeof createConnection>) {
    this.connection = connection;
  }
  clear(): void {
    this.collection.clear();
  }
  getItem(key: string): O3Document | undefined {
    return this.collection.get(key);
  }
  getAllNodes(key: string): O3Document["nodes"] | null {
    const allNodes = [];
    const o3 = this.getItem(key);
    if (!o3) return null;
    function recursive(n: any) {
      if (n.nodeType === 1 && n.childNodes) {
        allNodes.push(n);
        n.childNodes.forEach((child) => {
          recursive(child);
        });
      }
    }
    o3.nodes.forEach((child) => {
      recursive(child);
    });
    return allNodes;
  }
  getAllTextNodes(key: string): O3Document["nodes"] | null {
    const allNodes = [];
    const o3 = this.getItem(key);
    if (!o3) return null;
    function recursive(n: any) {
      if (n.nodeType === 3 && n.parent) {
        allNodes.push(n);
      }
      if (n.nodeType === 1 && n.childNodes) {
        n.childNodes.forEach((child) => {
          recursive(child);
        });
      }
    }
    o3.nodes.forEach((child) => {
      recursive(child);
    });
    return allNodes;
  }
  getAllEncodedNodes(key: string): O3Document["nodes"] | null {
    const allNodes = [];
    const o3 = this.getItem(key);
    if (!o3) return null;
    function recursive(n: any) {
      if (n.nodeType === 1 && n.childNodes) {
        allNodes.push(n);
        n.childNodes.forEach((child) => {
          recursive(child);
        });
      }
    }
    o3.encodedNodes.forEach((child) => {
      recursive(child);
    });
    return allNodes;
  }
  getAllEncodedTextNodes(key: string): O3Document["nodes"] | null {
    const allNodes = [];
    const o3 = this.getItem(key);
    if (!o3) return null;
    function recursive(n: any) {
      if (n.nodeType === 3 && n.parent) {
        allNodes.push(n);
      }
      if (n.nodeType === 1 && n.childNodes) {
        n.childNodes.forEach((child) => {
          recursive(child);
        });
      }
    }
    o3.encodedNodes.forEach((child) => {
      recursive(child);
    });
    return allNodes;
  }
  /**
   * special algo to encode unsupported attributes
   * this will help to parse nodes and Ogone required features
   * like --for={...}
   * or item={myValue}
   * or { ...spread }
   */
  encode(text: string): string {
    const contextSet = new Set();
    let result = '';
    let tagLevel = 0;
    let jsxAttributesLevel = 0;
    let stringLevel = 0;
    let cancelNodesLevel = 0;
    let previous: string = '';
    function provideChar(char: string) {
      result += char;
    }
    function provideEncoded(char: string) {
      result += urlencode(char, 'gbk');
    }
    while (text.length) {
      const char = text[0];
      cancelNodesLevel = previous === '<' && this.cancelledNode.find((tag) => text.startsWith(`${tag}`)) ?
        1 :
          previous === '<' && this.cancelledNode.find((tag) => text.startsWith(`/${tag}`)) ?
          0 : cancelNodesLevel;
      let size = contextSet.size;
      switch (char) {
        case '%':
          /**
           * no matching pair in URIComponent
           */
          provideChar(char);
          break;
        case '"':
        case "'":
        case "`":
          if (!jsxAttributesLevel) {
            if (contextSet.add(char).size === size) {
              provideChar(char);
              stringLevel = 0;
            } else if (tagLevel) {
              stringLevel = 1;
              provideChar(char);
            }
          } else {
            provideEncoded(char);
          }
          break;
        case '{':
          if (stringLevel || jsxAttributesLevel || contextSet.add(char).size === size) {
            provideEncoded(char);
          } else {
            provideChar(char);
            jsxAttributesLevel = 1;
          }
          break;
        case '}':
          if (contextSet.delete('{')) {
            jsxAttributesLevel = 0;
            provideChar(char);
          } else {
            provideEncoded(char);
          }
          break;
        case '<':
          if (cancelNodesLevel
              || stringLevel
              || jsxAttributesLevel
              || contextSet.add(char).size === size) {
            /**
             * the Set didn't accept the new character because it's already inside
             * we need to encode it
             */
            provideEncoded(char);
          } else {
            tagLevel = 1;
            provideChar(char);
          }
          break;
        case '>':
          if (stringLevel || jsxAttributesLevel) {
            provideEncoded(char);
          } else {
            if (contextSet.delete('<')) {
              tagLevel = 0;
              provideChar(char);
            }
          }
          break;
        default:
          if (stringLevel || jsxAttributesLevel && tagLevel) {
            provideEncoded(char);
          } else {
            provideChar(char);
          }
          break;
      }
      text = text.slice(1);
      previous = char;
    }
    return result;
  }
  /**
   * take the two list of encoded nodes
   * and not encoded
   * and each corresponding nodes
   * returns true if the nodes are sync
   */
  syncNodes(key: string): boolean {
    const o3 = this.getItem(key);
    if (!o3) return false;
    const { text } = o3;
    const pureNodes = this.getAllNodes(key);
    const encodedNodes = this.getAllEncodedNodes(key);
    pureNodes
      .filter((n: any, i: number) => encodedNodes[i])
      .forEach((n: any, i: number) => {
        const candidate: typeof n = encodedNodes[i];
        candidate.startIndex = n.startIndex;
        candidate.endIndex = n.endIndex;
        /**
         * this padding is to avoid getting the index of the attributes
         * with : <div
         *        ^~~~
         * we need to shift here
         *     : <div ...
         *           ^~~~
         */
        const paddingTagName = n.tagName.length + 1;
        let startText = text.slice(n.startIndex + paddingTagName);
        /**
         * create a new object using entries
         */
        n.attribs = Object.fromEntries(
          Object.entries(candidate.attribs)
            .map((attribute: any) => [urlencode.decode(attribute[0], 'gbk'), urlencode.decode(attribute[1].replace(/(^\{|\}$)/gi, ''), 'gbk')])
        );
        n.getAttributes = () => candidate.attributes.map((attr: any) => {
          attr.value = urlencode.decode(attr.value, 'gbk');
        });
        /**
         * create the properties
         * the idea is to get the position of each attributes
         */
        const entries = Object.entries(candidate.attribs);
        n.attributesMap = new Map(entries.map(([key, value]: [string, string]) => {
          const item = {
            name: key.startsWith('{') ? '--spread' : urlencode.decode(key),
            type: key.startsWith('{') ?
              'spread' :
              key.startsWith('--') && value.startsWith('{')?
                'flag' :
                value.startsWith('{') ?
                  'property' :
                  'normal',
            value: urlencode.decode(
              value.startsWith('{') && value.replace(/(^\{|\}$)/gi, '')
              || value,
              'gbk'),
            position: {
              start: 0,
              end: 0,
            }
          };
          /**
           * start decoding and getting attributes position
           */
          let realKey = key;
          let realValue = value;
          /**
           * this can interrupt the diagnostics process
           * because some characters are not supported by the URIComponent
           */
          try {
            realKey = urlencode.decode(key);
          } catch(err) {}
          try {
            realValue = urlencode.decode(value);
          } catch(err) {}
          if (item.type === 'spread') {
            item.position.start = startText.indexOf(realKey);
            item.position.end = startText.indexOf(realKey) + realKey.length;
            startText = startText.replace(realKey, ' '.repeat(realKey.length));
          } else if (item.type === 'normal' && !value.length) {
            const complete = `${realKey}`;
            item.position.start = startText.indexOf(complete);
            item.position.end = startText.indexOf(complete) + complete.length;
            startText = startText.replace(complete, ' '.repeat(complete.length));
          } else if (item.type === 'normal') {
            const complete = `${realValue}`;
            item.position.start = startText.indexOf(complete) - 2 - realKey.length;
            item.position.end = startText.indexOf(complete) + complete.length;
            startText = startText.replace(complete, ' '.repeat(complete.length));
          } else {
            const complete = `${realKey}=${realValue}`;
            item.position.start = startText.indexOf(complete);
            item.position.end = startText.indexOf(complete) + complete.length;
            startText = startText.replace(complete, ' '.repeat(complete.length));
          }
          /**
           * add the position of the node
           */
          item.position.start += + n.startIndex + paddingTagName;
          item.position.end += + n.startIndex + paddingTagName;
          return [item.name, item];
        })) as Map<string, {
          type: "normal" | "flag" | "property" | "spread";
          value: string;
          position: {
            start: number;
            end: number;
          }
        }>;
      });
    return true;
  }
}