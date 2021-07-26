import { TextDocument } from 'vscode-languageserver-textdocument';
import OgoneTypescript from "./OgoneTypescript";
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
  InitializeResult,
  Color,
  ColorPresentation,
  Position,
  Range,
  Hover,
} from 'vscode-languageserver';
import { getCSSLanguageService, getLESSLanguageService, Stylesheet, ColorInformation } from 'vscode-css-languageservice';
import { YAMLDocument, getLanguageService } from 'vscode-yaml-languageservice';
import { getLanguageService as getHTMLLS, HTMLDocument } from 'vscode-html-languageservice';

const cssLanguageService = getCSSLanguageService();
const lessLanguageService = getLESSLanguageService();
const yamlLanguageService = getLanguageService({});
const htmlLanguageService = getHTMLLS();

export default class OgoneProject extends OgoneTypescript {
  protected getTextCursorPosition(text: string, position: Position): number {
    const lines = text.split(/(?<=\n)/);
    let cursor = 0;
    lines
      .slice(0, position.line + 1)
      .forEach((line, i) => {
        let chars = 0;
        while (chars < position.character) {
          chars++;
        }
        if (i === position.line) {
          cursor += + chars;
        } else {
          cursor += + line.length;
        }
      });
    return cursor;
  }
  protected getCursorPosition(document: TextDocument, position: Position): number {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { text } = o3;
      return this.getTextCursorPosition(text, position);
    }
    return 0;
  }
  getYAMLDocument(document: TextDocument, text: string): [YAMLDocument, TextDocument] {
    const embeddedYAMLDocument = TextDocument.create(document.uri, 'yaml', document.version, text);
    const yamlDoc = yamlLanguageService.parseYAMLDocument(embeddedYAMLDocument);
    return [yamlDoc, embeddedYAMLDocument];
  }
  getStylesheet(document: TextDocument, text: string): [Stylesheet, TextDocument] {
    const embeddedStyleDocument = TextDocument.create(document.uri, 'css', document.version, text);
    const stylesheet = cssLanguageService.parseStylesheet(embeddedStyleDocument);
    return [stylesheet, embeddedStyleDocument];
  }
  getHTMLDocument(document: TextDocument, text: string): [HTMLDocument, TextDocument] {
    const embeddedStyleDocument = TextDocument.create(document.uri, 'css', document.version, text);
    const htmlDoc = htmlLanguageService.parseHTMLDocument(embeddedStyleDocument);
    return [htmlDoc, embeddedStyleDocument];
  }
  /**
   * start using CSS language service's completion
   * provide to it only the parts with CSS
   */
  public doStyleCompletion(document: TextDocument): ReturnType<typeof cssLanguageService.doComplete> {
    const o3 = this.getItem(document.uri);
    const cursor = this.getCursorPosition(document, this.position);
    if (o3 && this.position) {
      let result = this.getCompleteCSS(document);
      /**
       * slice the content
       * using the cursor position
       */
       let slicedText = result.slice(0, cursor);
      result = this.getSlicedStyle(result, cursor);
      /**
       * create virtual css document
       */
      const [stylesheet, embeddedStyleDocument] = this.getStylesheet(document, result);
      const completeList = cssLanguageService.doComplete(embeddedStyleDocument, this.position, stylesheet);
      /**
       * need to select the correct
       */
      completeList.items = completeList.items.filter((item: CompletionItem) => {
        /**
         * start recomputing the range
         * of textEdit
         */
        const match = slicedText.match(/([^\s;\{\}]*?)$/i);
        let unshift = 0;
        if (match) {
          const { index } = match;
          unshift = cursor - index;
          const range = Range.create(
            document.positionAt(cursor - unshift),
            document.positionAt(cursor),
          );
          item.textEdit.range = range;
        }
        return !item.deprecated;
      });
      return completeList;
    }
  }
  getSlicedStyle(text: string, cursor: number): string {
    let result = text;
    result = result.slice(0, cursor);
      /**
       * start extracting the rule
       * or the query selector that is currently edited
       */
      let match,
        regInRule = /([^;\}\{]*?)(\{)([^\{\}]*?)$/i,
        regInSelector = /([^\{;\}]*?)$/i;
      if ((match = result.match(regInRule))) {
        const { index } = match;
        result = `${' '.repeat(index)}${result.slice(index).replace(/([^\{\}])(?=.*?)$/i, ' ')}\n}`;
      } else if ((match = result.match(regInSelector))) {
        const { index } = match;
        result = `${' '.repeat(index)}${result.slice(index)}`;
      }
      result = `${result.slice(0, cursor)}${result.slice(cursor)}`;
      result = result.replace(/\$/gi, ' ');
      return result;
  }
  /**
   * returns true if the cursor is inside the top level template element
   */
  isInTemplate(document: TextDocument, position: Position) {
    const o3 = this.getItem(document.uri);
    const cursor = this.getCursorPosition(document, position);
    let result = false;
    if (o3) {
      const { nodes } = o3;
      const templates = nodes.filter((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === 'template');
      templates.forEach((node: any) => {
        if (node.startIndex <= cursor && node.endIndex >= cursor) {
          result = true;
        }
      });
    }
    return result;
  }
  /**
   * returns true if the cursor is inside the style element
   */
  isInStyleNode(document: TextDocument, position: Position) {
    const o3 = this.getItem(document.uri);
    const cursor = this.getCursorPosition(document, position);
    let result = false;
    if (o3) {
      const allNodes = this.getAllNodes(document.uri);
      const styles = allNodes.filter((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === 'style');
      styles.forEach((node: any) => {
        if (!node.childNodes.length) return;
        const [textnode] = node.childNodes;
        if (!textnode) return;
        if (textnode.startIndex <= cursor && textnode.endIndex >= cursor) {
          result = true;
        }
      });
    }
    return result;
  }
  /**
   * if the position of the user is currently on the def modifier
   */
  isInDefModifier(document: TextDocument, position: Position) {
    const o3 = this.getItem(document.uri);
    const cursor = this.getCursorPosition(document, position);
    if (o3) {
      const defModifier = o3.modifiers.find((modifier) => modifier.name === 'def');
      if (defModifier) {
        return cursor <= defModifier.position.end && cursor >= defModifier.position.start;
      }
    }
    return false;
  }
  public getCompleteCSS(document: TextDocument): string {
    const o3 = this.getItem(document.uri);
    let result = ``;
    if (o3) {
      const allNodes = this.getAllNodes(document.uri);
      const styles = allNodes.filter((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === 'style');
      styles.forEach((node: any) => {
        if (!node.childNodes.length) return;
        const [textnode] = node.childNodes;
        // add white spaces before css text
        if (!result.length) {
          result += o3.text.slice(0, textnode.startIndex)
            .replace(/[^\n]/gi, ' ');
        } else {
          result += o3.text.slice(textnode.startIndex - result.length)
            .replace(/[^\n]/gi, ' ');
        }
        // add the css text
        result += textnode.data;
      });
    }
    return result;
  }
  findDocumentColors(document: TextDocument): ColorInformation[] {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const [styleSheet, embedded] = this.getStylesheet(document, this.getCompleteCSS(document));
      const colors = [
        ...lessLanguageService.findDocumentColors(embedded, styleSheet),
      ];

      return colors;
    }
    return [];
  }
  getColorPresentation(document: TextDocument, color: Color, range: Range): ColorPresentation[] {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const [styleSheet, embedded] = this.getStylesheet(document, this.getCompleteCSS(document));
      const colors = [
        ...lessLanguageService.getColorPresentations(embedded, styleSheet, color, range),
      ];
      return colors;
    }
    return [];
  }
  /**
   * validate that all is correct in the style elements
   */
  validateStylesSheets(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const [styleSheet, embedded] = this.getStylesheet(document, this.getCompleteCSS(document));
      const result = lessLanguageService.doValidation(embedded, styleSheet, {
        validate: true,
      });
      this.saveDiagnostics(document, result.filter((diagnostic) => {
        return !(diagnostic.code === 'unknownAtRules'
          && (diagnostic.message.endsWith('@const') || diagnostic.message.endsWith('@export')))
      }));
    }
  }
  /**
   * should save the protocol modifiers
   */
  protected saveModifiers(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      // clear all the previous modifiers
      o3.modifiers.splice(0);
      // start parsing modifiers
      const { nodes } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      const texts = proto && proto.childNodes.filter((t, n) => t.nodeType === 3 && t.data.trim().length);
      if (texts) {
        texts.forEach((text: any) => {
          let match;
          (match = text.data.match(/^\n{0,1}(?<spaces>[\s]*)(declare\b|default\b|def\b|compute|before\-each|case\s+([`'"])(.+?)(\3))\s*\:/i))
          if (match && match.groups) {
            const { spaces } = match.groups;
            o3.protocolOpeningSpacesAmount = spaces && spaces.length || 0;
          }
          let data = text.data;
          const reg = new RegExp(`(?:\n{1}|^)(?:\\s){${o3.protocolOpeningSpacesAmount}}(?=(?:case|default\\b|def\\b|declare\\b|before-each\\b|compute))`, 'mi');
          const splittedProtocol = data.split(reg);
          splittedProtocol.forEach((modification: string) => {
            function renderMatch(match: RegExpMatchArray) {
              if (match && match.groups) {
                const [input] = match;
                const { args, name } = match.groups;
                const indexOfModification = data.indexOf(modification) + text.startIndex;
                const endOfModification = indexOfModification + modification.length;
                o3.modifiers.push({
                  name,
                  args,
                  source: modification,
                  content: modification.slice(input.length),
                  position: {
                    start: indexOfModification,
                    end: endOfModification,
                  }
                });
              }
            }
            const matchModifier = modification.match(/^(?<name>def\b|declare\b|default\b|compute\b|before-each\b)(?<args>.*?)\:/i);
            const matchCaseModifier = modification.match(/^(?<name>case)(\s*)(['"])(?<args>.*?)(\3)\s*\:/i);
            renderMatch(matchModifier);
            renderMatch(matchCaseModifier);
          })
        });
      }
    }
  }
  protected async validateDefModifier(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const defModifier = o3.modifiers.find((modifier) => modifier.name === 'def');
      if (defModifier) {
        const [yamlDocument, embeddedYamlDoc] = this.getYAMLDocument(document, defModifier.source);
        try {
          const diagnostics = await yamlLanguageService.doValidation(embeddedYamlDoc, yamlDocument);
          diagnostics.forEach((diag) => {
            const startCursor = this.getTextCursorPosition(defModifier.source, diag.range.start);
            const endCursor = this.getTextCursorPosition(defModifier.source, diag.range.end);
            diag.range = Range.create(
              document.positionAt(defModifier.position.start + startCursor),
              document.positionAt(defModifier.position.start + endCursor),
            );
          })
          this.saveDiagnostics(document, diagnostics);
        } catch (err) {
          this.saveDiagnostics(document, [
            {
              severity: 1,
              range: Range.create(
                document.positionAt(defModifier.position.start),
                document.positionAt(defModifier.position.end),
              ),
              message: `YAML Error Caught :\n${err.message}`,
            }
          ])
        }
      }
    }
  }
  public async doYAMLHover(document: TextDocument, position: Position): Promise<Hover> {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const defModifier = o3.modifiers.find((modifier) => modifier.name === 'def');
      if (defModifier) {
        const cursor = this.getCursorPosition(document, position);
        const [yamlDocument, embeddedYamlDoc] = this.getYAMLDocument(document, defModifier.source);
        const hover = await yamlLanguageService.doHover(embeddedYamlDoc, document.positionAt(cursor - defModifier.position.start), yamlDocument);
        return hover
      }
    }
  }
  public doStyleHover(document: TextDocument, position: Position): Hover {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const [styleSheet, embedded] = this.getStylesheet(document, this.getCompleteCSS(document));
      const result = lessLanguageService.doHover(embedded, position, styleSheet, {
        documentation: true,
        references: true,
      });
      return result;
    }
  }
  public doHTMLHover(document: TextDocument, position: Position): Promise<Hover> {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const [html,] = this.getHTMLDocument(document, document.getText());
      const result: Promise<Hover> = new Promise((resolve) => {
        setTimeout(() => {
          resolve(htmlLanguageService.doHover(document, position, html, {
            documentation: true,
            references: true,
          }));
        }, 900);
      })
      return result;
    }
  }
}
