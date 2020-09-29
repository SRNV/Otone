import { TextDocument } from 'vscode-languageserver-textdocument';
import * as HTMLParser from 'htmlparser2';
import OgoneUpdate from './OgoneUpdate';
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

export default class Ogone extends OgoneUpdate {
  constructor(connection: ReturnType<typeof createConnection>) {
    super();
    this.setConnection(connection);
  }
  /**
   *
   * @param document {TextDocument}
   * add document to collection and update if it's already saved
   */
  read(document: TextDocument) {
    if (this.collection.has(document.uri)) {
      this.update(document);
    } else {
      this.subscribe(document);
      this.update(document);
    }
  }
  subscribe(document: TextDocument): boolean {
    const text = document.getText();
    const nodes = HTMLParser.parseDOM(text, {
      withStartIndices: true,
      withEndIndices: true,
      xmlMode: true,
    });
    const firstNode = nodes[0];
    const item: O3Document = {
      document,
      text,
      nodes,
      assets: firstNode.nodeType === 3 ? (nodes[0] as any).nodeValue : null,
    };
    this.collection.set(document.uri, item);
    return true;
  }
}