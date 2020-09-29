import { TextDocument } from 'vscode-languageserver-textdocument';
import HTMLParser from 'htmlparser2';
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
    const item: O3Document = {
      document,
      text,
      node: HTMLParser.parseDOM(text, {
        withStartIndices: true,
        withEndIndices: true,
        xmlMode: true,
      }),
    };
    this.collection.set(document.uri, item);
    this.connection.console.warn('node value');
    this.connection.console.warn(item.node[0].nodeValue);
    return true;
  }
}