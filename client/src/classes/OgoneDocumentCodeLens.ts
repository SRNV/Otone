import {
  DocumentLink,
  ProviderResult,
  TextDocument,
  languages,
  workspace,
  Position,
  DocumentHighlight,
  ColorInformation,
  HoverProvider,
  Hover,
  Color,
  window,
  ColorPresentation,
  Range,
  Command,
  CancellationToken,
  MarkdownString,
  CodeLensProvider,
  CodeLens
} from 'vscode';
import jsdoc from 'jsdoc-api';
import * as path from 'path';
import * as fs from 'fs';
import OgoneDocument from './OgoneDocument';
import OgoneDocumentLinks from './OgoneDocumentLinks';

export interface OgoneDocumentCodeLensConstructorOptions {
}
export default class OgoneDocumentCodeLens extends OgoneDocument implements CodeLensProvider {
  constructor(opts: OgoneDocumentCodeLensConstructorOptions) {
    super();
  }
  public provideCodeLenses(document: TextDocument, token: CancellationToken): ProviderResult<CodeLens[]> {
    this.setDocument(document);
    return this.render(document);
  }
  render(document: TextDocument): ProviderResult<CodeLens[]> {
    const topOfDocument = new Range(0, 0, 0, 0);
    const { visibleRanges } = window.activeTextEditor
    const { text } = this;
    const endOfDocument = new Range(
      document.positionAt(text.length),
      document.positionAt(text.length),
    );
    const allNodes = this.AllNodes;
    const componentReg = /component\s*$/i;
    const components = allNodes
      .filter((node) => {
        const isMatch = this.text && !!this.text.slice(0, node.startIndex)
          .match(componentReg);
        return !node.parentNode && isMatch
      })
      .map((node) => {
        const range = new Range(
          document.positionAt(node.startIndex),
          document.positionAt(node.endIndex)
        );
        const result = [];
        const hasTemplate = node.children.find((child) => child.name === 'template');
        const hasProto = node.children.find((child) => child.name === 'proto');
        if (node.attribs.type === 'app') {
            result.push(new CodeLens(range, {
              command: 'otone.startHSESession',
              title: `preview ${node.name}`,
            }));
        }
        if (!hasTemplate) {
          result.push(new CodeLens(range, {
            command: 'extension.addConsoleLog',
            title: `add <template>`,
            tooltip: `add a template element to ${node.name}`,
          }));
        }
        if (!hasProto) {
          result.push(new CodeLens(range, {
            command: 'extension.addConsoleLog',
            title: `add <proto>`,
            tooltip: `add a proto element to ${node.name}`,
          }));
        }
        if (node.children.length) {
          result.push(
            new CodeLens(range, {
              command: 'extension.do',
              title: `[X]`,
              tooltip: `deeply closes all elements in the component ${node.name}`,
            }),
          );
        }
        return result;
      });

    const nodes = allNodes
    .filter((node) => ['template', 'proto'].includes(node.name)
      && !node.parentNode.parentNode
      && components.includes(node.parentNode))
    .map((node) => {
      const elementRange = new Range(
        document.positionAt(node.startIndex),
        document.positionAt(node.endindex),
      );
      const lenses: CodeLens[] = [];
      switch (node.name) {
        case 'template':
          if (!node.childNodes.find((child) => child.name === 'style')) {
            lenses.push(
              new CodeLens(elementRange, {
                command: 'extension.addConsoleLog',
                title: `add <style>`,
              }),
            );
          }
          if (!node.childNodes.find((child) => child.name === 'head')) {
            lenses.push(
              new CodeLens(elementRange, {
                command: 'extension.addConsoleLog',
                title: `add <head>`,
                tooltip: 'append a head element into the template',
              }),
            );
          }
          lenses.push(new CodeLens(elementRange, {
              command: 'extension.addConsoleLog',
              title: `add any`,
              tooltip: 'append any element into the template',
            }),
          );
          break;
        default: break;
      }
      return lenses
    });
    const endOfFileLens = [
      new CodeLens(endOfDocument, {
        command: 'otone.navigation.previous',
        title: '< previous',
        tooltip: 'return to the previous file',
      }),
      new CodeLens(endOfDocument, {
        command: 'otone.action.create',
        title: 'create component',
        tooltip: 'start creating a new component',
      }),
    ];
    const result = [
      ...components.flat(),
      ...nodes.flat(),
      new CodeLens(topOfDocument, {
        command: 'otone.navigation.previous',
        title: '< previous',
        tooltip: 'return to the previous file',
      }),
      new CodeLens(topOfDocument, {
        command: 'otone.action.create',
        title: 'create component',
        tooltip: 'start creating a new component',
      }),
      new CodeLens(topOfDocument, {
        command: 'otone.action.import',
        title: 'import component',
        tooltip: 'import a component from anywhere',
      }),
    ];
    if (text.length) {
      result.push(...endOfFileLens);
    }
    return result;
  }
}