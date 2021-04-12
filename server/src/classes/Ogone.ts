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
    const nodes = this.render(text);
    const encodedText = this.encode(text);
    const item: O3Document = {
      document,
      text,
      encodedText,
      encodedNodes: this.render(encodedText),
      nodes,
      assets: this.getAssets(nodes),
    };
    this.collection.set(document.uri, item);
    this.syncNodes(document.uri);
    return true;
  }
}