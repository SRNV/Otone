import { TextDocument } from 'vscode-languageserver-textdocument';
import Collections from "./Collections";
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
import {
  ts,
  Project,
  ScriptTarget,
  SourceFile,
  CodeBlockWriter,
} from 'ts-morph';

export interface ComponentSources {
  proto: SourceFile;
  template: SourceFile;
}

export default class OgoneProject extends Collections {
  protected project?: Project;
  protected componentSources?: ComponentSources;
  protected saveDiagnostics(diagnostics: Diagnostic[]) {
    this.diagnostics = this.diagnostics.concat(diagnostics);
  }
  protected sendDiagnostics(document: TextDocument) {
    this.connection.sendDiagnostics({ uri: document.uri, diagnostics: this.diagnostics });
  }
  protected readProject(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    const { text } = o3;
    /**
     * create the project from ts-morph
     */
    this.project = new Project({
      compilerOptions: {
        target: ScriptTarget.ESNext,
        allowJs: true,
      },
      resolutionHost: this.resolutionHost,
    });
    /**
     * now create the sourceFiles
     */
    this.componentSources = this.renderSourceFiles(document);
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
  protected renderSourceFiles(document: TextDocument): ComponentSources {
    const options = {
      overwrite: true,
    };
    return {
      /**
       * component's proto
       */
      proto: this.project.createSourceFile("protocol.ts", (writer) => {
        this.writeProtocol(document, writer);
      }, options),
      /**
       * component's template
       * should be tsx
       */
      template: this.project.createSourceFile("template.tsx", (writer) => {
        this.writeTemplate(document, writer);
      }, options),
    };
  }
  /**
   * write export statement for the sourceFile
   * it will add lines to the writer
   * @param writer
   */
  protected writeProtocol(document: TextDocument, writer: CodeBlockWriter) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const dependencies = this.getDependencies(document);
      const lines = `
      ${dependencies}
      export class Protocol {

      };`.split('\n');
      console.warn(lines);
      lines.forEach((line) => {
        writer.writeLine(line);
      });
    }
  }
  /**
   * write import statement for the sourceFile
   * it will add lines to the writer
   * @param writer
   */
  protected writeTemplate(document: TextDocument, writer: CodeBlockWriter) {
    const dependencies = this.getDependencies(document);
    const render = this.renderTemplate(document);
    const lines = `
    ${dependencies}
      import { Protocol } from './protocol.ts'; export class Template extends Protocol { render() { return ${render};
      }};`.split('\n');
    console.warn(1, lines);
    lines.forEach((line) => {
      writer.writeLine(line);
    });
  }
  /**
   * returns all the dependencies of the component
   */
  private getDependencies(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { assets } = o3;
      const reg = /import\s+component\s+(.+?)\s+from\s+(['"])(.*?)(\.o3)(\2)(\;){0,1}/i;
      let dependencies = assets;
      let match;
      while (dependencies && (match = dependencies.match(reg))) {
        const [input] = match;
        dependencies = dependencies.replace(reg, ' '.repeat(input.length))
      }
      return dependencies;
    } else {
      return '';
    }
  }
  /**
   * should return a string containing a JSX like template
   */
  private renderTemplate(document: TextDocument): string {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes, text } = o3;
      function renderJSX(node: any): string {
        console.warn(node.attributes, node.attribs);
        if (node.nodeType === 3) return `${node.data}`;
        if (node.nodeType === 1 && ['script', 'style'].includes(node.name)) return `<${node.tagName}>{\`${node.childNodes ? node.childNodes.map(renderJSX) : '' }\`}</${node.tagName}>`;
        return `<${node.tagName}>${node.childNodes ? node.childNodes.map(renderJSX) : '' }</${node.tagName}>`;
      }
      const template = nodes.find((node: any) => node.nodeType === 1 && node.name === "template");
      if (template) return renderJSX(template);
    }
    return '';
  }
}
