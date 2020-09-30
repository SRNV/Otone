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
	InitializeResult
} from 'vscode-languageserver';

export default class OgoneUpdate extends Collections {
  protected update(document: TextDocument) {
    // reset diagnostics
    this.diagnostics.splice(0);

    this.updateDocument(document);
    this.inspectForbiddenTextnodes(document);
    this.inspectNoUnknownElementOnTopLevel(document);
    this.inspectForbiddenDuplication(document);
    this.expectStyleElementToBeLast(document);
    // protcol's specific diagnostics
    this.inspectForbiddenElementInsideProto(document);
    this.inspectProtocolTypes(document);
    // at the end send diagnostics
    this.sendDiagnostics(document);
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
            start: o3.document.positionAt(proto.startIndex + 1),
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
                  start: o3.document.positionAt(n.startIndex + 1),
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
        && !["template", "proto", "style"].includes(n.tagName.toLowerCase())
      );
      if (notAllowedElementsOnTopLevel.length) {
        notAllowedElementsOnTopLevel.forEach((element: any) => {
          this.saveDiagnostics([{
            message: `${element.tagName} has to be inserted into the template, as it is not supported on top level. template (XML), proto (typescript), style (obvious) are supported`,
            severity: DiagnosticSeverity.Error,
            range: {
              start: o3.document.positionAt(element.startIndex + 1),
              end: o3.document.positionAt(element.endIndex + 1)
            },
            source: "otone",
          }]);
        })
      }
    }
  }

  protected expectStyleElementToBeLast(document: TextDocument) : void{
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const notWellPlacedTag = nodes.filter(n => n.nodeType === 1).find((n: any, i, arr) =>
        n.tagName.toLowerCase() !== "style"
        && arr[i -1]
        && (arr[i -1] as any).tagName.toLowerCase() === "style"
      );
      if (notWellPlacedTag) {
        this.saveDiagnostics([{
          message: "no other elements are allowed after a style element",
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(notWellPlacedTag.startIndex + 1),
            end: o3.document.positionAt(notWellPlacedTag.endIndex + 1)
          },
          source: "otone",
        }])
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
              start: o3.document.positionAt(proto.startIndex + 1),
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
              start: o3.document.positionAt(template.startIndex + 1),
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
                start: o3.document.positionAt(node.startIndex + 1),
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
    return firstNode.nodeType === 3 ? (nodes[0] as any).nodeValue : null
  }
}