import { TextDocument } from 'vscode-languageserver-textdocument';
import { Project } from 'ts-morph';
import type Collections from './Collections';
import type { O3Document, NodeSourceTSPositions, AttributeSourceTSPositions, ModifierSourceTSPositions } from '../types/definition';
import { DiagnosticSeverity } from 'vscode-languageserver-types';
import OgoneTypescript from './OgoneTypescript';
import { ModifierDescription } from '../types/definition';

export default class OgoneSource {
  nodesPositionInTSSourceFile: NodeSourceTSPositions[] = [];
  attributesPositionInTSSourceFile: AttributeSourceTSPositions[] = [];
  modifiersPositionInTSSourceFile: ModifierSourceTSPositions[] = [];
  constructor(private opts: {
    /**
     * the project to emit typescript errors
     * coming from ts-morph
     */
    project: Project,
    /**
     * the document uri
     */
    uri: string,
    /**
     * the connection to send diagnostics
     */
    connection: Collections['connection'],
    extension: OgoneTypescript,
  }) { }
  get project() {
    return this.opts.project;
  }
  get uri () {
    return this.opts.uri;
  }
  get connection() {
    return this.opts.connection;
  }
  get extension() {
    return this.opts.extension;
  }
  async emit(document: TextDocument, o3: O3Document) {
    if (!o3) return;
    /**
     * clear previous saved nodes/attributes positions
     */
    this.nodesPositionInTSSourceFile.splice(0);
    this.attributesPositionInTSSourceFile.splice(0);
    this.modifiersPositionInTSSourceFile.splice(0);
    const source = this.renderComponentContext(document, o3);
    const sourceFile = this.project.createSourceFile(`${document.uri}.tsx`, source, { overwrite: true });
    const emit = await this.project.emit();
    const diags = [];
    const diagnostics = [
      ...sourceFile.getPreEmitDiagnostics(),
      ...emit.getDiagnostics(),
    ];

    /**
     * only parsing errors here
     */
    // @ts-ignore
    diagnostics.forEach((diag) => {
      const start = diag.getStart();
      const end = start + diag.getLength();
      const nodes = this.nodesPositionInTSSourceFile;
      const attributes = this.attributesPositionInTSSourceFile;
      const modifiers = this.modifiersPositionInTSSourceFile;
      const candidateAttribute = attributes.find((attribute) =>
        attribute.position.start <= start
        && attribute.position.end >= end)
      const candidateNode = nodes.find((node) =>
        (node.node.nodeType === 1 && node.node.name === (source && source.slice(start, end)))
        || node.node.nodeType === 3
          && node.position.start <= start
          && node.position.end >= end);
      const candidateModifier = modifiers.find((modifier) =>
        modifier.position.start <= start
        && modifier.position.end >= end);
      const result = {
        message: diag.getMessageText(),
        severity: DiagnosticSeverity.Error,
        range: {
          start: o3.document.positionAt(0),
          end: o3.document.positionAt(0)
        },
        source: `otone (TSError [${diag.getCode()}])`,
      };
      console.warn(diag.getMessageText(), source && source.slice(start, end));
      if (candidateAttribute && candidateAttribute.visible !== false) {
        /**
         * attributes
         */
        const diffStart = start - candidateAttribute.position.start;
        const diffEnd = end - candidateAttribute.position.start;
        result.range.start = o3.document.positionAt(candidateAttribute.attribute.position.start + diffStart);
        result.range.end = o3.document.positionAt(candidateAttribute.attribute.position.start + diffEnd);
        diags.push(result);
      } else if (candidateNode && candidateNode.visible !== false) {
        /**
         * for elements and textnodes
         */
        // TODO issue here with the attribute and the component
        candidateNode.visible = false;
        const diffStart = start - candidateNode.position.start - (candidateNode.position.offset || 0);
        const diffEnd = end - candidateNode.position.start - (candidateNode.position.offset || 0);
        result.range.start = o3.document.positionAt(candidateNode.node.startIndex + diffStart);
        result.range.end = o3.document.positionAt(candidateNode.node.startIndex + diffEnd);
        diags.push(result);
      } else if (candidateModifier && candidateModifier.visible !== false) {
        /**
         * for modifiers in protocol
         */
        const diffStart = start - candidateModifier.position.start - (candidateModifier.position.offset || 0);
        const diffEnd = end - candidateModifier.position.start - (candidateModifier.position.offset || 0);
        result.range.start = o3.document.positionAt(candidateModifier.modifier.position.start + diffStart);
        result.range.end = o3.document.positionAt(candidateModifier.modifier.position.start + diffEnd);
        diags.push(result);
      }
    });
    this.extension.saveDiagnostics(document, diags);
  }
      /**
 * returns all the dependencies of the component
 */
  private getDependencies(document: TextDocument, o3: O3Document) {
    if (o3) {
      const { assets } = o3;
      if (!assets) return '';
      const reg = /import\s+component\s+(.+?)\s+from\s+(['"])(.*?)(\.o3)(\2)(\;){0,1}/i;
      let dependencies = assets;
      let match;
      while (dependencies && (match = dependencies.match(reg))) {
        const [input] = match;
        dependencies = dependencies.replace(reg, ' '.repeat(input.length))
      }
      return dependencies;
    } else {
      return '';
    }
  }
  private renderComponentContext(document: TextDocument, o3: O3Document): string {
    if (o3) {
      const { nodes } = o3;
      const template = nodes.find((node: any) => node.nodeType === 1 && node.name === "template");
      const proto: any = nodes.find((node: any) => node.nodeType === 1 && node.name === "proto");
      const beforeSwitchBodyPart = `
      declare function h(...args: unknown[]): unknown;
      declare function hf(...args: unknown[]): unknown;
      type OgoneCOMPONENTComponent<T> = { children?: any; } & T;
      type OgoneASYNCComponent<T> = OgoneCOMPONENTComponent<T>;
      type OgoneSTOREComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;
      type OgoneROUTERComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;
      type OgoneCONTROLLERComponent<T> = { namespace: string; } & OgoneCOMPONENTComponent<T>;

      declare namespace h.JSX {
        export interface IntrinsicElements {
          [k: string]: any;
        }
      };
      class Protocol {}
      class Component extends Protocol {
        ${this.typeIsAsync(proto.attribs.type) ? 'async': ''} runtime(this: Protocol, _state: string | number, ctx: any, event: any, _once: number = 0) {
          try {
            switch(_state) {
            `;
      const previousPart = `${beforeSwitchBodyPart}${this.renderSwitchStatement(document, o3, beforeSwitchBodyPart)}
            }
          } catch(err) {
            throw err;
          }
        }
        render(this: Protocol) {
          return (<>`;
      let result = `${previousPart}${template ? this.renderJSX(template, previousPart) : ''}</>); }}`;
      return result;
    }
    return '';
  }
  protected typeIsAsync(type: string) {
    return ['async', 'store', 'controller'].includes(type);
  }
  protected linkTextnodePositionInTSSourceFile(node: any, result: string, previousText: string, offset: number) {
    this.nodesPositionInTSSourceFile.push({
      node,
      content: result,
      position: {
        offset,
        start: previousText.length,
        end: previousText.length + result.length,
      }
    });
    return result;
  }
  protected linkNodePositionInTSSourceFile(node: any, result: string, previousText: string, visible = true) {
    const item = {
      node,
      content: result,
      visible,
      position: {
        start: previousText.length,
        end: previousText.length + result.length,
      }
    };
    /**
     * as first matching node is used as a candidate for diagnostics
     * we need to put this item in first position if it's not visible
     */
    if (visible === false) {
      this.nodesPositionInTSSourceFile = [item, ...this.nodesPositionInTSSourceFile];
    } else {
      this.nodesPositionInTSSourceFile.push(item);
    }
    return result;
  }
  protected linkAttributePositionInTSSourceFile(attribute: any, result: string, previousText: string) {
    this.attributesPositionInTSSourceFile.push({
      attribute,
      content: result,
      position: {
        start: previousText.length,
        end: previousText.length + result.length,
      }
    });
    return result;
  }
  protected linkModifierPositionInTSSourceFile(modifier: ModifierDescription, result: string, previousText: string) {
    this.modifiersPositionInTSSourceFile.push({
      modifier,
      content: result,
      position: {
        start: previousText.length,
        end: previousText.length + result.length,
      }
    });
    return result;
  }
  /**
   * provides the body of the component's switch statement
   * and links component's protocol modifiers positions
   * @param document text document used to display diagnostics
   * @param o3 the O3Document used to display diagnostics
   * @param previousText the part before the result, should start at position 0 of the document
   * @returns the switch body, including user's code
   */
  renderSwitchStatement(document: TextDocument, o3: O3Document, previousText: string) {
    let result = '';
    let previousTextAugmented = previousText;
    const modifiers = o3.modifiers.filter((modifier) => {
      return ['case', 'default'].includes(modifier.name);
    });
    modifiers.forEach((modifier) => {
      let content = this.linkModifierPositionInTSSourceFile(modifier, modifier.source, previousTextAugmented);
      result += content;
      previousTextAugmented += content;
    });
    return result;
  }
  /**
   *
   * @param node element or textnode to render
   * @returns the JSX string
   */
  protected renderJSX(node: any, previousText: string): string {
    let result = node.data && node.data.trim().length ? `{\`${node.data}\`}` : node.data;
    if (node.nodeType === 8) {
      return ' '.repeat(`<!--${node.data}-->`.length);
    }
    /**
     * render Textnodes
     */
    if (node.nodeType === 3) return this.linkTextnodePositionInTSSourceFile(node, result, previousText, 2);
    /**
     * build the string for elements
     */
    const isAutoClosing = node.childNodes && !node.childNodes.length;
    const openTag = `<${node.tagName}`;
    const attributes = `${this.renderAttributes(node, previousText + openTag)}${isAutoClosing ? ' /' : ''}>`;
    let previousPart = openTag + attributes;
    let previousPartCount = previousPart.length;
    const childJSX = node.childNodes ? node.childNodes.map((child) => {
      let result = this.renderJSX(child, previousText + ' '.repeat(previousPartCount));
      previousPartCount += result.length;
      return result;
    }).join('') : '';
    const beginPart = this.linkNodePositionInTSSourceFile(node, `${previousPart}${childJSX}`, previousText);
    const endPart = !isAutoClosing ? `</${node.tagName}>` : '';
    result = `${beginPart}${endPart}`;
    /**
     * render elements
     */
    return result;
  }
  /**
   *
   * @param node element or textnode to render
   * @returns the JSX string for attributes
   */
  protected renderAttributes(node: any, previousText: string): string {
    let result = '';
    if (node && node.attributesMap) {
      const { attributesMap } = node;
      result = attributesMap.size ? ' ' : result;
      attributesMap.forEach((attribute) => {
        const {
          value,
          name,
          type,
          source,
          position,
          data,
        } = attribute;
        switch (true) {
          case type === 'normal' && !!value.length:
            result += this.linkAttributePositionInTSSourceFile(attribute,
              `${name}="${value}" `,
              previousText + result);
            break;
          case type === 'normal' && !value.length:
            result += this.linkAttributePositionInTSSourceFile(attribute,
              `${name} `,
              previousText + result);
            break;
          case type === 'property' && !!value.length:
            result += this.linkAttributePositionInTSSourceFile(attribute,
              `${name}={${value}} `,
              previousText + result);
            break;
          default:
            result += ' '.repeat((name + value).length + 3);
            break;
        }
      });
    }
    return result;
  }
}