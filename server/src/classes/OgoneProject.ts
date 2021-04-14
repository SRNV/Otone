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
  Color,
  ColorPresentation,
  Position,
  Range,
} from 'vscode-languageserver';
import {
  ts,
  Project,
  ScriptTarget,
  SourceFile,
  CodeBlockWriter,
} from 'ts-morph';
import { getCSSLanguageService, getSCSSLanguageService, Stylesheet, ColorInformation } from 'vscode-css-languageservice';
const cssLanguageService = getCSSLanguageService();
const scssLanguageService = getSCSSLanguageService();
export interface ComponentSources {
  proto: SourceFile;
  template: SourceFile;
}

export default class OgoneProject extends Collections {
  protected project?: Project;
  protected componentSources?: ComponentSources;
  protected getCursorPosition(document: TextDocument, position: Position): number {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { text } = o3;
      const lines = text.split(/(?<=\n)/);
      let cursor = 0;
      lines
        .slice(0, position.line + 1)
        .forEach((line, i) => {
        let chars = 0;
        while (chars < position.character) {
          chars++;
        }
        if (i === position.line) {
          cursor +=+ chars;
        } else {
          cursor +=+ line.length;
        }
      });
      return cursor;
    }
    return 0;
  }
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
      if (!assets) return '';
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
        if (node.nodeType === 3) return `${node.data}`;
        if (node.nodeType === 1 && ['script', 'style'].includes(node.name)) return `<${node.tagName}>{\`${node.childNodes ? node.childNodes.map(renderJSX) : ''}\`}</${node.tagName}>`;
        return `<${node.tagName}>${node.childNodes ? node.childNodes.map(renderJSX) : ''}</${node.tagName}>`;
      }
      const template = nodes.find((node: any) => node.nodeType === 1 && node.name === "template");
      if (template) return renderJSX(template);
    }
    return '';
  }
  getStylesheet(document: TextDocument, text: string): [Stylesheet, TextDocument] {
    const embeddedStyleDocument = TextDocument.create(document.uri, 'css', document.version, text);
    const stylesheet = cssLanguageService.parseStylesheet(embeddedStyleDocument);
    return [stylesheet, embeddedStyleDocument];
  }
  /**
   * start using CSS language service's completion
   * provide to it only the parts with CSS
   */
   public doStyleCompletion(document: TextDocument): ReturnType<typeof cssLanguageService.doComplete> {
    const o3 = this.getItem(document.uri);
    const cursor = this.getCursorPosition(document, this.position);
    if (o3 && this.position) {
      let result = this.getCompleteCSS(document);
      /**
       * slice the content
       * using the cursor position
       */
      result = result.slice(0, cursor);
      let slicedText = result;
      /**
       * start extracting the rule
       * or the query selector that is currently edited
       */
      let match,
        regInRule = /([^;\}\{]*?)(\{)([^\{\}]*?)$/i,
        regInSelector = /([^\{;\}]*?)$/i;
      if ((match = result.match(regInRule))) {
        const { index } = match;
        result = `${' '.repeat(index)}${result.slice(index).replace(/([^\{\}])(?=.*?)$/i, ' ')}\n}`;
      } else if ((match = result.match(regInSelector))) {
        const { index } = match;
        result = `${' '.repeat(index)}${result.slice(index)}`;
      }
      result = `${result.slice(0, cursor)}${result.slice(cursor)}`;
      result = result.replace(/\$/gi, ' ');
      /**
       * create virtual css document
       */
      const [stylesheet, embeddedStyleDocument] = this.getStylesheet(document, result);
      const completeList = cssLanguageService.doComplete(embeddedStyleDocument, this.position, stylesheet);
      /**
       * need to select the correct
       */
      completeList.items = completeList.items.filter((item: CompletionItem) => {
        /**
         * start recomputing the range
         * of textEdit
         */
        const match = slicedText.match(/([^\s;\{\}]*?)$/i);
        let unshift = 0;
        if (match) {
          const { index } = match;
          unshift = cursor - index;
          const range = Range.create(
            document.positionAt(cursor - unshift),
            document.positionAt(cursor),
          );
          item.textEdit.range = range;
        }
        return !item.deprecated;
      });
			return completeList;
    }
  }
  isInStyleNode(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    const cursor = this.getCursorPosition(document, this.position);
    let result = false;
    if (o3 && this.position) {
      const allNodes = this.getAllNodes(document.uri);
      const styles = allNodes.filter((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === 'style');
      styles.forEach((node: any) => {
        if (!node.childNodes.length) return;
        const [textnode] = node.childNodes;
        if (!textnode) return;
        if (textnode.startIndex <= cursor && textnode.endIndex >= cursor) {
          result = true;
        }
      });
    }
    return result;
  }
  public getCompleteCSS(document: TextDocument): string {
    const o3 = this.getItem(document.uri);
    let result = ``;
    if (o3) {
      const allNodes = this.getAllNodes(document.uri);
      const styles = allNodes.filter((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === 'style');
      styles.forEach((node: any) => {
        if (!node.childNodes.length) return;
        const [textnode] = node.childNodes;
        // add white spaces before css text
        if (!result.length) {
          result += o3.text.slice(0, textnode.startIndex)
            .replace(/[^\n]/gi, ' ');
        } else {
          result += o3.text.slice(textnode.startIndex - result.length)
          .replace(/[^\n]/gi, ' ');
        }
        // add the css text
        result += textnode.data;
      });
    }
    return result;
  }
  findDocumentColors(document: TextDocument): ColorInformation[] {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const [styleSheet, embedded] = this.getStylesheet(document, this.getCompleteCSS(document));
      const colors = [
        ...scssLanguageService.findDocumentColors(embedded, styleSheet),
      ];

      return colors;
    }
    return [];
  }
  getColorPresentation(document: TextDocument, color: Color, range: Range): ColorPresentation[] {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const [styleSheet, embedded] = this.getStylesheet(document, this.getCompleteCSS(document));
      const colors = [
        ...scssLanguageService.getColorPresentations(embedded, styleSheet, color, range),
      ];
      return colors;
    }
    return [];
  }
}
