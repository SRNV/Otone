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
      const { nodes } = o3;
      const forbiddenTextNodes = nodes.filter((node, id) => node.nodeType === 3 && id !== 0);
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
}