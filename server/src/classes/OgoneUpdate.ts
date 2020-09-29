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
    const o3 = this.getItem(document.uri);
    if (o3) {
      o3.text = document.getText();
      o3.nodes = this.render(o3.text);
      o3.assets = this.getAssets(o3.nodes);
    }
    if (o3) {
      const { nodes } = o3;
      const forbiddenTextNodes = nodes.filter((node, id) =>
        node.nodeType === 3
        && id !== 0
        && (node as any).nodeValue.trim().length
      );
      forbiddenTextNodes.forEach((node) => {
        this.sendDiagnostics(o3.document, [
          {
            severity: DiagnosticSeverity.Error,
            message: `forbidden textnode: ${(node as any).nodeValue}`,
            range: {
              start: o3.document.positionAt(node.startIndex),
              end: o3.document.positionAt(node.endIndex)
            },
            source: 'otone',
          }
        ]);
      });
    }
  }
  protected sendDiagnostics(document: TextDocument, diagnostics: Diagnostic[]) {
    this.connection.sendDiagnostics({ uri: document.uri, diagnostics });
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