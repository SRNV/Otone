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
    "app",
    "router",
    "gl",
  ];
  public readonly validProtocolAttributes: string[] = ['def', 'type', 'engine', 'namespace', 'base'];
  public readonly validTemplateAttributes: string[] = ['is', 'private', 'protected'];
  public readonly validStyleAttributes: string[] = ['--keyframes', 'name', 'global'];

  setConnection(connection: ReturnType<typeof createConnection>) {
    this.connection = connection;
  }
  clear(): void {
    this.collection.clear();
  }
  getItem(key: string): O3Document | undefined {
    return this.collection.get(key);
  }
  getAllNodes(key: string): O3Document["nodes"] | null {
    const allNodes = [];
    const o3 = this.getItem(key);
    if (!o3) return null;
    function recursive(n: any) {
      if (n.nodeType === 1 && n.childNodes) {
        allNodes.push(n);
        n.childNodes.forEach((child) => {
          recursive(child);
        });
      }
    }
    o3.nodes.forEach((child) => {
      recursive(child);
    });
    return allNodes;
  }
  getAllTextNodes(key: string): O3Document["nodes"] | null {
    const allNodes = [];
    const o3 = this.getItem(key);
    if (!o3) return null;
    function recursive(n: any) {
      if (n.nodeType === 3 && n.parent) {
        allNodes.push(n);
      }
      if (n.nodeType === 1 && n.childNodes) {
        n.childNodes.forEach((child) => {
          recursive(child);
        });
      }
    }
    o3.nodes.forEach((child) => {
      recursive(child);
    });
    return allNodes;
  }
}