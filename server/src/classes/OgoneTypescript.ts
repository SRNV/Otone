import Collections from './Collections';
import * as vscode from 'vscode';
import { TextDocument } from 'vscode-languageserver-textdocument';
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
  Color,
  ColorPresentation,
  Position,
  Range,
  Hover,
} from 'vscode-languageserver';
import { Project, ScriptTarget, ts } from "ts-morph";
import OgoneSource from './OgoneSource';

export default class OgoneTypescript extends Collections {
  private mapProject: Map<string, OgoneSource> = new Map();
  public resetDiagnostics(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (!o3) return;
    o3.diagnostics.splice(0);
  }
  public saveDiagnostics(document: TextDocument, diagnostics: Diagnostic[]) {
    const o3 = this.getItem(document.uri);
    if (!o3) return;
    o3.diagnostics = this.diagnostics.concat(diagnostics.filter((candidate) => {
      const notFound = !this.diagnostics.find((diag) => diag.severity === candidate.severity
      && diag.range.start.line === candidate.range.start.line
      && diag.range.end.line === candidate.range.end.line
      && diag.range.start.character === candidate.range.start.character
      && diag.range.end.character === candidate.range.end.character
      && diag.message === candidate.message)
      return notFound;
    }));
  }
  protected sendDiagnostics(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (!o3) return;
    this.connection.sendDiagnostics({ uri: document.uri, diagnostics: o3.diagnostics });
  }
  protected setProject(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3 && !this.mapProject.has(document.uri)) {
      this.mapProject.set(document.uri,
        new OgoneSource({
          project: new Project({
            resolutionHost: this.resolutionHost,
            compilerOptions: {
              jsx: 2,
              jsxFactory: 'h',
              jsxfragmentFactory: 'hf',
            }
          }),
          uri: document.uri,
          connection: this.connection,
          extension: this,
        })
      );
    }
  }
  protected async readProject(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    const { text, modifiers } = o3;
    this.setProject(document);
    if (!modifiers.find((modifier) => modifier.name === 'declare')) return;
    /**
     * now create the sourceFiles
     */
     const o3Source = this.mapProject.get(document.uri);
     if (o3 && o3Source) {
       await o3Source.emit(document, o3);
     }
  }
  protected resolutionHost(
    moduleResolutionHost,
    getCompilerOptions) {
    function removeTsExtension(moduleName: string) {
      return moduleName.replace(/\.(ts|js|tsx)$/i, '');
    }
    return {
      resolveModuleNames: (moduleNames, containingFile) => {
        const compilerOptions = getCompilerOptions();
        const resolvedModules: ts.ResolvedModule[] = [];

        for (const moduleName of moduleNames.map(removeTsExtension)) {
          const result = ts.resolveModuleName(moduleName, containingFile, compilerOptions, moduleResolutionHost);
          if (result.resolvedModule) resolvedModules.push(result.resolvedModule);
        }

        return resolvedModules;
      },
    };
  }
}