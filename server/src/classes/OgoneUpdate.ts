import { TextDocument } from 'vscode-languageserver-textdocument';
import * as HTMLParser from 'htmlparser2';
import { O3Document } from '../types/definition';
import Collections from './Collections';
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
} from 'vscode-languageserver';
import * as ts from 'typescript';
import * as path from 'path';
import * as fs from 'fs';
import * as childProcess from 'child_process';
export default class OgoneUpdate extends Collections {
  protected update(document: TextDocument) {
    // reset diagnostics
    this.diagnostics.splice(0);
    this.updateDocument(document);
    this.inspectForbiddenTextnodes(document);
    this.inspectNoUnknownElementOnTopLevel(document);
    this.inspectForbiddenDuplication(document);
    this.requiredLineBreakForProtoAndTemplate(document);
    this.EOFDiagnostics(document);
    // asset's specific diagnostics
    this.fileNotFound(document);
    this.uselessAssets(document);
    this.unsupportedPatternInAsset(document);
    // protcol's specific diagnostics
    // this.inspectForbiddenElementInsideProto(document);
    this.inspectProtocolTypes(document);
    this.inspectUselessProtocolAttrs(document);
    this.inspectRequiredProtocolNamespace(document);
    this.BadStartForProto(document);
    // template's specific diagnostics
    this.inspectUselessTemplateAttrs(document);
    this.getForbiddenTemplate(document);
    this.getUselessTemplate(document);
    // at the end send all diagnostics
    this.sendDiagnostics(document);
  }
  protected unsupportedPatternInAsset(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      let { assets } = o3;
      let text = assets;
      const regExps = [
        /\/\/(.*?)(\n)/gi,
        /\/\*(.*?)*\//gmi,
        /\bimport\s+(["'])(.+?)(\1)(;){0,1}/gmi,
        /\bimport(\s+type|component){0,1}\s+(.+?)\s+from\s+(["'])(.+?)(\3)(;){0,1}/gmi,
        //,
      ];
      if (assets) {
        regExps
          .filter((regExp) => assets.match(regExp))
          .forEach((regExp) => {
            let match = assets.match(regExp)!;
            const [value] = match;
            assets = assets.replace(regExp, ' '.repeat(value.length));
          });
        console.warn(assets);
        if (assets.trim().length) {
          const reg = new RegExp(`(${assets
            .trim()
            .replace(/\s+/gi, '|')
            .replace(/([^\d\w\|])/gi, '\\$1')
          })`, 'i');
          console.warn(1, reg);
          let match ;
          while ((match = assets.match(reg))) {
            let { index } = match;
            const [input] = match;
            this.saveDiagnostics([{
              message: `Unexpected syntax. only import statements and comments are supported here.`,
              severity: DiagnosticSeverity.Error,
              range: {
                start: o3.document.positionAt(index),
                end: o3.document.positionAt(input.length + index)
              },
              source: "otone",
            }]);
            assets = assets.replace(reg, ' '.repeat(input.length))
          }
        }
      }
    }
  }
  protected BadStartForProto(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      const text = proto && proto.childNodes.find((t, n) => t.nodeType === 3 && n === 0);
      let match;
      if (proto
        && text
        && text.data.trim().length
        && !(match = text.data.match(/^([\s\n]*)(declare|default|def|compute|before\-each|case\s+([`'"])(.+?)(\3))\s*\:/i))) {
        this.saveDiagnostics([{
          message: `unexpected start of the protocol. only def, default, declare, compute, before-each or a case are supported as modifiers.`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(text.startIndex),
            end: o3.document.positionAt(text.endIndex + 1)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected uselessAssets(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      let { assets } = o3;
      let match;
      if (assets
        && assets.length
        && !assets.trim().length
        && (match = assets.match(/^\s+$/i))) {
        const [input] = match;
        const { index } = match;
        this.saveDiagnostics([{
          message: `useless spaces starting the file`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(index),
            end: o3.document.positionAt(index + input.length)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected async fileNotFound(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    const workspace = await this.connection.workspace.getWorkspaceFolders();
    if (o3) {
      let { assets } = o3;
      let match;
      const assetRegExp = /(?<=import\b(.+?))\bfrom\s+([`'"])(?<pathToAsset>.+?)(\2)/mi;
      while (assets && (match = assets.match(assetRegExp)) && match.groups) {
        const [input] = match;
        const { index, groups } = match;
        const { pathToAsset } = groups;
        const newPath = workspace && path.normalize(path.join(path.dirname(o3.document.uri), pathToAsset)).replace(workspace[0].uri, '');
        if (pathToAsset
          && pathToAsset.startsWith('.')
          && !fs.existsSync(newPath)) {
          this.saveDiagnostics([{
            message: `unreachable file: this file doesn't exist`,
            severity: DiagnosticSeverity.Error,
            range: {
              start: o3.document.positionAt(index),
              end: o3.document.positionAt(index + input.length)
            },
            source: "otone",
          }]);
        } else if (pathToAsset
          && pathToAsset.startsWith('@/')
          && !fs.existsSync(pathToAsset.replace('@/', ''))) {
          this.saveDiagnostics([{
            message: `unreachable file: this file doesn't exist`,
            severity: DiagnosticSeverity.Error,
            range: {
              start: o3.document.positionAt(index),
              end: o3.document.positionAt(index + input.length)
            },
            source: "otone",
          }]);
        }
       assets = assets.replace(assetRegExp, ' '.repeat(input.length))
      }
    }
  }
  protected EOFDiagnostics(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { text } = o3;
      if (!text.endsWith('\n')) {
        this.saveDiagnostics([{
          message: `a line break at the end of the file is required`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(text.length -1),
            end: o3.document.positionAt(text.length)
          },
          source: "otone",
        }]);
      }
      let match;
      if ((match = text.match(/(?<=\n)(\n)$/gmi))) {
        const [input] = match;
        const { index } = match;
        this.saveDiagnostics([{
          message: `multiple line break at the end of the file`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(index),
            end: o3.document.positionAt(index + input.length)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected requiredLineBreakForProtoAndTemplate(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes, text } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      const lastProtoChild: any = proto
        && proto.childNodes
        && proto.childNodes[proto.childNodes.length - 1];
      const template: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "template");
      const lastTemplateChild: any = template
        && template.childNodes
        && template.childNodes[template.childNodes.length - 1];
      if (proto
        && !text[proto.startIndex -1]?.match(/\n/)
        && proto.startIndex -1 > 0) {
        this.saveDiagnostics([{
          message: `a line break is required before the proto element`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(proto.startIndex),
            end: o3.document.positionAt(proto.endIndex + 1)
          },
          source: "otone",
        }]);
      }
      if (template
        && !text[template.startIndex -1]?.match(/\n/)
        && template.startIndex -1 > 0) {
        this.saveDiagnostics([{
          message: `a line break is required before the template element`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(template.startIndex),
            end: o3.document.positionAt(template.endIndex + 1)
          },
          source: "otone",
        }]);
      }
      if (lastProtoChild && !text[lastProtoChild.endIndex]?.match(/\n/)) {
        this.saveDiagnostics([{
          message: `a line break is required after this element`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(lastProtoChild.startIndex),
            end: o3.document.positionAt(lastProtoChild.endIndex + 1)
          },
          source: "otone",
        }]);
      }
      if (lastTemplateChild && !text[lastTemplateChild.endIndex]?.match(/\n/)) {
        this.saveDiagnostics([{
          message: `a line break is required after this element`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(lastTemplateChild.startIndex),
            end: o3.document.positionAt(lastTemplateChild.endIndex + 1)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected getForbiddenTemplate(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      const template: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "template");
      if (proto && template && ['controller'].includes(proto.attribs.type)) {
        this.saveDiagnostics([{
          message: `template element is not allowed in ${proto.attribs.type} components`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(template.startIndex),
            end: o3.document.positionAt(template.endIndex + 1)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected getUselessTemplate(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const template: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "template");
      if (template
        && (!template.attribs.is
          || !template.attribs.is.length)
        && (!template.childNodes.length
          || template.childNodes.length === 1
          && template.childNodes[0].nodeType === 3
          && !template.childNodes[0].data.trim().length)) {
        this.saveDiagnostics([{
          message: `this template is useless because it's empty`,
          severity: DiagnosticSeverity.Warning,
          range: {
            start: o3.document.positionAt(template.startIndex),
            end: o3.document.positionAt(template.endIndex + 1)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected inspectRequiredProtocolNamespace(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      if (proto
        && ['controller', 'store'].includes(proto.attribs.type)
        && (proto.attribs.namespace === undefined || !proto.attribs.namespace.length)) {
        this.saveDiagnostics([{
          message: `namespace is required for ${proto.attribs.type} components`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(proto.startIndex),
            end: o3.document.positionAt(proto.endIndex + 1)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected inspectUselessTemplateAttrs(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const validAttributes = this.validTemplateAttributes;
      const template: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "template");
      if (template) {
        const keys = Object.keys(template.attribs);
        keys
          .filter(key => !validAttributes.includes(key))
          .map((key) => {
            const findAttributePosition = o3.text.indexOf(key, template.startIndex);
            this.saveDiagnostics([{
              message: `template attribute '${key}' is not supported, 'is' attribute is supported`,
              severity: DiagnosticSeverity.Error,
              range: {
                start: o3.document.positionAt(findAttributePosition),
                end: o3.document.positionAt(findAttributePosition + key.length)
              },
              source: "otone",
            }]);
          });
      }
    }
  }
  protected inspectUselessProtocolAttrs(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const validAttributes = this.validProtocolAttributes;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      if (proto) {
        const keys = Object.keys(proto.attribs);
        keys
          .filter(key => !validAttributes.includes(key)
            && (!['conroller', 'store'].includes(proto.attribs.type) && key !== 'namespace')
            || (!['conroller', 'store'].includes(proto.attribs.type) && !validAttributes.includes(key)))
          .map((key) => {
            const findAttributePosition = o3.text.indexOf(key, proto.startIndex);
            this.saveDiagnostics([{
              message: `protocol attribute '${key}' is not supported`,
              severity: DiagnosticSeverity.Error,
              range: {
                start: o3.document.positionAt(findAttributePosition),
                end: o3.document.positionAt(findAttributePosition + key.length)
              },
              source: "otone",
            }]);
          });
      }
    }
  }
  protected inspectProtocolTypes(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      if (proto && proto.attribs.type && proto.attribs.type.length && !this.supportedTypes.includes(proto.attribs.type)) {
        this.saveDiagnostics([{
          message: `protocol type ${proto.attribs.type} is not supported`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(proto.startIndex),
            end: o3.document.positionAt(proto.startIndex + 6)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected inspectForbiddenElementInsideProto(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      if (proto) {
        proto.childNodes
            .filter((n: any) => n.nodeType === 1)
            .map((n: any) => {
              this.saveDiagnostics([{
                message: `unsupported <${n.tagName}> found inside <proto>`,
                severity: DiagnosticSeverity.Error,
                range: {
                  start: o3.document.positionAt(n.startIndex),
                  end: o3.document.positionAt(n.endIndex + 1)
                },
                source: "otone",
              }]);
            });
      }
    }
  }
  protected inspectNoUnknownElementOnTopLevel(document: TextDocument) : void{
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const notAllowedElementsOnTopLevel = nodes.filter((n: any) =>
        n.nodeType === 1
        && !["template", "proto"].includes(n.tagName.toLowerCase())
      );
      if (notAllowedElementsOnTopLevel.length) {
        notAllowedElementsOnTopLevel.forEach((element: any) => {
          this.saveDiagnostics([{
            message: `${element.tagName} has to be inserted into the template, as it is not supported on top level. template (XML), proto (typescript) are supported`,
            severity: DiagnosticSeverity.Error,
            range: {
              start: o3.document.positionAt(element.startIndex),
              end: o3.document.positionAt(element.endIndex + 1)
            },
            source: "otone",
          }]);
        })
      }
    }
  }
  protected inspectForbiddenDuplication(document: TextDocument): void {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const protos = nodes.filter((node: any) => node.tagName && node.tagName.toLowerCase() === "proto")
      const templates = nodes.filter((node: any) => node.tagName && node.tagName.toLowerCase() === "template")
      if (protos.length > 1) {
        protos.forEach((proto) => {
          this.saveDiagnostics([{
            severity: DiagnosticSeverity.Error,
            message: `Cannot set multiple protocol`,
            range: {
              start: o3.document.positionAt(proto.startIndex),
              end: o3.document.positionAt(proto.endIndex + 1)
            },
            source: 'otone',
          }]);
        });
      }
      if (templates.length > 1) {
        templates.forEach((template) => {
          this.saveDiagnostics([{
            severity: DiagnosticSeverity.Error,
            message: `Cannot set multiple template`,
            range: {
              start: o3.document.positionAt(template.startIndex),
              end: o3.document.positionAt(template.endIndex + 1)
            },
            source: 'otone',
          }]);
        });
      }
    }
  }
  protected inspectForbiddenTextnodes(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const forbiddenTextNodes = nodes.filter((node, id) =>
        node.nodeType === 3
        && id !== 0
        && (node as any).nodeValue.trim().length
      );
      forbiddenTextNodes.forEach((node) => {
        if ((node as any).nodeValue && (node as any).nodeValue.trim().length) {
          this.saveDiagnostics([
            {
              severity: DiagnosticSeverity.Error,
              message: `forbidden textnode: ${(node as any).nodeValue}`,
              range: {
                start: o3.document.positionAt(node.startIndex),
                end: o3.document.positionAt(node.endIndex + 1)
              },
              source: 'otone',
            }
          ]);
        }
      });
    }
  }
  protected updateDocument(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      o3.text = document.getText();
      o3.nodes = this.render(o3.text);
      o3.assets = this.getAssets(o3.nodes);
    }
  }
  protected saveDiagnostics(diagnostics: Diagnostic[]) {
    this.diagnostics = this.diagnostics.concat(diagnostics);
  }
  protected sendDiagnostics(document: TextDocument) {
    this.connection.sendDiagnostics({ uri: document.uri, diagnostics: this.diagnostics });
  }
  render(text:string) {
    return HTMLParser.parseDOM(text, {
      withStartIndices: true,
      withEndIndices: true,
      xmlMode: true,
    });
  }
  getAssets(nodes): string | null {
    const firstNode = nodes[0];
    return firstNode && firstNode.nodeType === 3 ? (nodes[0] as any).nodeValue : null
  }
}