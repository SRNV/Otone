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

export default class Collections {
  protected collection: Map<string, O3Document> = new Map();
  protected connection: ReturnType<typeof createConnection>;
  protected diagnostics: Diagnostic[] = [];
  public readonly supportedTypes: string[] = [
    "component",
    "async",
    "controller",
    "store",
    "router",
    "gl",
  ];

  setConnection(connection: ReturnType<typeof createConnection>) {
    this.connection = connection;
  }
  clear(): void {
    this.collection.clear();
  }
  getItem(key: string): O3Document | undefined {
    return this.collection.get(key);
  }
}