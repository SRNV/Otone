import { TextDocument } from 'vscode-languageserver-textdocument';
import * as HTMLParser from 'htmlparser2';
import { O3Document } from '../types/definition';
import OgoneProject from './OgoneProject';
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
  CompletionList,
	InitializeResult,
} from 'vscode-languageserver';
import * as path from 'path';
import * as fs from 'fs';
import { HTMLElementDeprecatedTagNameMap, SVGElementTagNameMap, HTMLElementTagNameMap } from '../utils/tagnameMaps';

export default class OgoneUpdate extends OgoneProject {
  private flags = [
    /**
     * structural flags
     */
    '--for',
    '--await',
    '--if',
    '--else-if',
    '--else',
    /**
     * DOM L3 events
     */
    '--click',
    '--dblclick',
    '--mouseenter',
    '--mouseover',
    '--mousemove',
    '--mousedown',
    '--mouseup',
    '--mouseleave',
    '--keypress',
    '--keydown',
    '--keyup',
    '--wheel',
    /**
     * custom event flags
     */
    '--event',
    /**
     * style flags
     */
    '--class',
    '--style',
    '--keyframes',
    /**
     * value flags
     */
    '--bind',
    /**
     * router flags
     */
    '--router-go',
    '--router-dev-tool',
    /**
     * async flags
     */
    '--defer',
    '--then',
    '--finally',
    '--catch',
  ];
  protected async update(document: TextDocument) {
    // reset diagnostics
    this.diagnostics.splice(0);
    this.updateDocument(document);
    this.saveModifiers(document);
    // now the document is updated
    await this.readProject(document);
    // TODO implement a custom lexer for Ogone CSS
    // await this.validateStylesSheets(document);
    await this.validateDefModifier(document);
    this.inspectForbiddenTextnodes(document);
    this.inspectNoUnknownElementOnTopLevel(document);
    this.inspectForbiddenDuplication(document);
    this.requiredLineBreakForProtoAndTemplate(document);
    this.requireLineBreakForLines(document);
    this.EOFDiagnostics(document);
    this.getTrailingSpaces(document);
    this.checkEmptyForStatement(document);
    this.checkForStatementPattern(document);
    this.checkWrongFlagAttributes(document);
    this.requireLineBreakAfterAttributes(document);
    // asset's specific diagnostics
    await this.fileNotFound(document);
    this.getDeclaredComponentMultipleTime(document);
    this.requireExtensionForImportedComponent(document);
    this.uselessAssets(document);
    this.unsupportedPatternInAsset(document);
    // protcol's specific diagnostics
    // this.inspectForbiddenElementInsideProto(document);
    this.inspectProtocolTypes(document);
    this.inspectUselessProtocolAttrs(document);
    this.inspectRequiredProtocolNamespace(document);
    this.BadStartForProto(document);
    this.getUnsupportedModifiers(document);
    // template's specific diagnostics
    this.inspectUselessTemplateAttrs(document);
    this.getForbiddenTemplate(document);
    this.getUselessTemplate(document);
    this.getElementsSupport(document);
    this.getTextElementSupport(document);
    // at the end send all diagnostics
    this.sendDiagnostics(document);
  }
  protected requireLineBreakAfterAttributes(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { text } = o3;
      const allNodes = this.getAllNodes(document.uri);
      allNodes.forEach((n: any) => {
        const keys = Object.entries(n.attribs);
        const spacesBeforeNode = text.slice(n.startIndex);
      });
    }
  }
  protected checkWrongFlagAttributes(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const allNodes = this.getAllNodes(document.uri);
      allNodes.forEach((n: any) => {
        const keys = Object.entries(n.attribs);
        keys
          .map(([key, value]: [string, string]) => {
            if (!n.attributesMap) return;
            const attribute = n.attributesMap.get(key);
            if (key.startsWith('--') && attribute.type !== 'flag' && value.length) {
              this.saveDiagnostics([{
                message: `Unexpected: ${key} should be opened with curly braces`,
                severity: DiagnosticSeverity.Error,
                range: {
                  start: o3.document.positionAt(attribute.position.start + key.length),
                  end: o3.document.positionAt(attribute.position.end)
                },
                source: "otone",
              }]);
            } else if (key.startsWith('--')
              && (!this.flags.includes(key)
                && !this.flags.find((flag) => key.startsWith(`${flag}:`)))) {
                  this.saveDiagnostics([{
                    message: `Unexpected: ${key} is not a supported flag`,
                    severity: DiagnosticSeverity.Error,
                    range: {
                      start: o3.document.positionAt(attribute.position.start),
                      end: o3.document.positionAt(attribute.position.start + key.length)
                    },
                    source: "otone",
                  }]);
            }
          });
      })
    }
  }
  protected checkForStatementPattern(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const allNodes = this.getAllNodes(document.uri);
      allNodes.forEach((n: any) => {
        if (!n.attributesMap) return;
        const keys = Object.entries(n.attribs);
        keys
          .map(([key, value]: [string, string]) => {
            if (key === '--for' && (
              !value.match(/^\((.+?),\s*(\w+?)\)\s+of\s+(.+?)$/gi)
                && !value.match(/^(.+?)\s+of\s+(.+?)$/gi)
            )) {
              const attribute = n.attributesMap.get(key);
              this.saveDiagnostics([{
                message: `Unexpected syntax: please follow one of these patterns:
              - <value> of <Array>
              - (<value>, <key>) of <Array>
                `,
                severity: DiagnosticSeverity.Error,
                range: {
                  start: o3.document.positionAt(attribute.position.start),
                  end: o3.document.positionAt(attribute.position.end)
                },
                source: "otone",
              }]);
            }
          });
      })
    }
  }
  protected checkEmptyForStatement(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { text } = o3;
      const allNodes = this.getAllNodes(document.uri);
      allNodes.forEach((n: any) => {
        const keys = Object.entries(n.attribs);
        keys
          .map(([key, value]: [string, string]) => {
            if (key === '--for' && !value.length) {
              this.saveDiagnostics([{
                message: `the for flag is empty, a value is required`,
                severity: DiagnosticSeverity.Error,
                range: {
                  start: o3.document.positionAt(n.startIndex + 1),
                  end: o3.document.positionAt(n.startIndex + n.tagName.length + 1)
                },
                source: "otone",
              }]);
            }
          });
      })
    }
  }
  protected getDeclaredComponentMultipleTime(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    const componentSet = new Set();
    if (o3) {
      let { assets } = o3;
      let match;
      const assetRegExp = /(?<importStatement>import\s+component\s+)(?<componentName>.+?)(?<fromStatement>\s+from)/mi;
      while (assets && (match = assets.match(assetRegExp)) && match.groups) {
        const [input] = match;
        const { index, groups } = match;
        const { componentName, importStatement } = groups;
        const { size } = componentSet;
        if (componentSet.add(componentName).size === size) {
          this.saveDiagnostics([{
            message: `the component ${componentName} has already been declared. cannot redeclare the same name for a component.`,
            severity: DiagnosticSeverity.Error,
            range: {
              start: o3.document.positionAt(index + importStatement.length),
              end: o3.document.positionAt(index + importStatement.length + componentName.length)
            },
            source: "otone",
          }]);
        }

        if (componentSet.add(componentName).size === size) {
          this.saveDiagnostics([{
            message: `the component ${componentName} has already been declared. cannot redeclare the same name for a component.`,
            severity: DiagnosticSeverity.Error,
            range: {
              start: o3.document.positionAt(index + importStatement.length),
              end: o3.document.positionAt(index + importStatement.length + componentName.length)
            },
            source: "otone",
          }]);
        }
       assets = assets.replace(assetRegExp, ' '.repeat(input.length))
      }
    }
  }
  protected requireLineBreakForLines(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    const lines = o3.text.split('\n');
    const { text } = o3;
    let start = 0;
    for (let i = 0, a = lines.length; i < a; i++) {
      const line = lines[i];
      if (line.replace(/((['"])(.+?)(\2)|\/\/(.*?)(?=\n))/gi, '').length > 150) {
        this.saveDiagnostics([{
          message: `too many characters on this line`,
          severity: DiagnosticSeverity.Warning,
          range: {
            start: o3.document.positionAt(text.indexOf(line)),
            end: o3.document.positionAt(text.indexOf(line) + line.length)
          },
          source: "otone",
        }]);
      }
      start += +line.length;
    }
  }
  protected getTrailingSpaces(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    let { text } = o3;
    let match, reg = /( +)(?=\n)/i;
    while ((match = text.match(reg))) {
      const [input] = match;
      const { index } = match;
      this.saveDiagnostics([{
        message: `remove trailing space here`,
        severity: DiagnosticSeverity.Error,
        range: {
          start: o3.document.positionAt(index),
          end: o3.document.positionAt(index + input.length)
        },
        source: "otone",
      }]);
      text = text.replace(reg, '_'.repeat(input.length))
    }
  }
  protected getTextElementSupport(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    const allTextnodes = this.getAllTextNodes(document.uri);
    if (o3 && allTextnodes) {
      // require spaces
      allTextnodes.filter((textnode: any) => textnode.nodeType === 3 && !textnode.data.match(/^[\n\s]/i))
        .forEach((textnode: any) => {
          this.saveDiagnostics([{
            message: `a space or a line break is required here`,
            severity: DiagnosticSeverity.Error,
            range: {
              start: o3.document.positionAt(textnode.startIndex),
              end: o3.document.positionAt(textnode.startIndex + 1)
            },
            source: "otone",
          }]);
        });
      allTextnodes.filter((textnode: any) => textnode.nodeType === 3 && !textnode.data.match(/[\n\s]$/i))
        .forEach((textnode: any) => {
          this.saveDiagnostics([{
            message: `a space or a line break is required here`,
            severity: DiagnosticSeverity.Error,
            range: {
              start: o3.document.positionAt(textnode.endIndex),
              end: o3.document.positionAt(textnode.endIndex + 1)
            },
            source: "otone",
          }]);
        });
    }
  }
  protected getElementsSupport(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    const allnodes = this.getAllNodes(document.uri);
    if (o3 && allnodes) {
      // for deprecated elements
      allnodes.filter((node: any) => HTMLElementDeprecatedTagNameMap.includes(node.tagName.toLowerCase()))
        .forEach((node: any) => {
          this.saveDiagnostics([{
            message: `${node.tagName.toLowerCase()} is deprecated`,
            severity: DiagnosticSeverity.Information,
            range: {
              start: o3.document.positionAt(node.startIndex),
              end: o3.document.positionAt(node.endIndex + 1)
            },
            source: "otone",
          }]);
        });
      // for unsupported elements
      allnodes.filter((node: any) =>
        node.name[0] !== node.name[0].toUpperCase()
        && !node.name.includes('-')
        && !['proto'].includes(node.name)
        && !SVGElementTagNameMap.includes(node.name)
        && !HTMLElementTagNameMap.includes(node.name)
        || node.name.endsWith('-'))
        .forEach((node: any) => {
          this.saveDiagnostics([{
            message: `${node.tagName.toLowerCase()} is not a supported element`,
            severity: DiagnosticSeverity.Error,
            range: {
              start: o3.document.positionAt(node.startIndex),
              end: o3.document.positionAt(node.endIndex + 1)
            },
            source: "otone",
          }]);
        });
    }
  }
  protected requireExtensionForImportedComponent(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      let { assets } = o3;
      let match;
      const assetRegExp = /import\s+(?!component\s+)(.+?)\bfrom\s+([`'"])(?<pathToAsset>.+?)(\.o3)(\3)(;){0,1}/mi;
      while (assets && (match = assets.match(assetRegExp)) && match.groups) {
        const [input] = match;
        const { index, groups } = match;
        const { pathToAsset } = groups;
        this.saveDiagnostics([{
          message: `you're trying to import a component as a module.\nPlease use the following syntax 'import component ... from '${pathToAsset}.o3'`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(index),
            end: o3.document.positionAt(index + input.length)
          },
          source: "otone",
        }]);
       assets = assets.replace(assetRegExp, ' '.repeat(input.length))
      }
    }
  }
  protected unsupportedPatternInAsset(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      let { assets } = o3;
      const regExps = [
        /(?<=['"])(?<removed>\S+?)(?=['"])/i,
        /\/\/(.*?)(?=\n)/i,
        /\/\*([\s\S]*)+\*\//i,
        /import\s+(["'])(.+?)(\1)(;){0,1}/i,
        /import(\s+type|\s+component){0,1}\s+(.+?)\s+from\s+(["'])(.+?)(\3)(;){0,1}/i,
        //,
      ];
      if (assets) {
        regExps
          .forEach((regExp) => {
            let match = assets.match(regExp);
            while (match) {
              const [value] = match;
              assets = assets.replace(regExp, ' '.repeat(value.length));
              match = assets.match(regExp);
            }
          });
        if (assets.trim().length) {
          const reg = new RegExp(`(${assets
            .trim()
            .replace(/([\s\n\r]+)/gi, '|')
            .replace(/([^\d\w\|])/gi, '\\$1')
          })`, 'mi');
          let match ;
          while ((match = assets.match(reg))) {
            let { index } = match;
            const [input] = match;
            this.saveDiagnostics([{
              message: `Unexpected ${input.length === 1 ? input[0] : 'token'}. only import statements and comments are supported here.`,
              severity: DiagnosticSeverity.Error,
              range: {
                start: o3.document.positionAt(index),
                end: o3.document.positionAt(input.length + index)
              },
              source: "otone",
            }]);
            assets = assets.replace(input, ' '.repeat(input.length))
          }
        }
      }
    }
  }
  protected BadStartForProto(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      const text = proto && proto.childNodes.find((t, n) => t.nodeType === 3 && n === 0);
      let match;
      if (proto
        && text
        && text.data.trim().length
        && !(match = text.data.match(/^([\s\n]*)(declare|default|def|compute|before\-each|case\s+([`'"])(.+?)(\3))\s*\:/i))) {
        this.saveDiagnostics([{
          message: `unexpected start of the protocol. only def, default, declare, compute, before-each or a case are supported as modifiers.`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(text.startIndex),
            end: o3.document.positionAt(text.endIndex + 1)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected getUnsupportedModifiers(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      const texts = proto && proto.childNodes.filter((t, n) => t.nodeType === 3 && t.data.trim().length);
      if (texts) {
        /**
         * when a text with the same indentation
         * of the first modifier is not supported
         */
        texts.forEach((text: any) => {
          let match;
          let data = new String(text.data);
          let dataIndent = new String(text.data);
          (match = text.data.match(/^\n{0,1}(?<spaces>[\s]*)(declare|default|def|compute|before\-each|case\s+([`'"])(.+?)(\3))\s*\:/i))
          if (match && match.groups) {
            const { spaces } = match.groups;
            o3.protocolOpeningSpacesAmount = spaces && spaces.length || 0;
          }
          const reg = new RegExp(`(?<=\\n{1}|^)(\\s){${o3.protocolOpeningSpacesAmount}}(?<modifier>[\\S](.*?))(?:\\s*\\:)`, 'i')
          while (proto
            &&  (match = data.match(reg))
            && match.groups) {
            const { index } = match;
            const [input] = match;
            const { modifier } = match.groups;
            if (
              !modifier.startsWith('case ')
              && ![
                'def',
                'default',
                'compute',
                'before-each',
                'case',
                'declare',
              ].includes(modifier)) {
              this.saveDiagnostics([{
                message: `unsupported modifier: ${modifier}.`,
                severity: DiagnosticSeverity.Error,
                range: {
                  start: o3.document.positionAt(text.startIndex + o3.protocolOpeningSpacesAmount + index),
                  end: o3.document.positionAt(text.startIndex + o3.protocolOpeningSpacesAmount + index + modifier.trim().length)
                },
                source: "otone",
              }]);
            }
            data = data.replace(reg, ' '.repeat(input.length))
          }
          /**
           * any text that has less indentation
           * than the first modifier
           */
          const lines = dataIndent.split('\n');
          let start = 0;
          const regIndent = new RegExp(`^(?!(\\s){${o3.protocolOpeningSpacesAmount}})([\\S]*?)`, 'i');
           for (let i = 0, a = lines.length; i < a; i++) {
            const line = lines[i];
            const match = line.match(regIndent);
            if (match && line.length) {
              const [input] = match;
              const { index } = match;
              if (text.startIndex + dataIndent.indexOf(line) + index !== text.startIndex) {
                this.saveDiagnostics([{
                  message: `protocol is broken here, please respect the indentation of the first modifier.`,
                  severity: DiagnosticSeverity.Error,
                  range: {
                    start: o3.document.positionAt(text.startIndex + dataIndent.indexOf(line) + index),
                    end: o3.document.positionAt(text.startIndex + dataIndent.indexOf(line) + line.length)
                  },
                  source: "otone",
                }]);
              }
            }
            start += + line.length;
          }
        });
      }
    }
  }
  protected uselessAssets(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      let { assets } = o3;
      let match;
      if (assets
        && assets.length
        && !assets.trim().length
        && (match = assets.match(/^\s+$/i))) {
        const [input] = match;
        const { index } = match;
        this.saveDiagnostics([{
          message: `useless spaces starting the file`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(index),
            end: o3.document.positionAt(index + input.length)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected async fileNotFound(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    const workspace = await this.connection.workspace.getWorkspaceFolders();
    if (o3) {
      let { assets } = o3;
      let match;
      const assetRegExp = /(?<=import\b(.+?)\bfrom\s+)([`'"])(?<pathToAsset>.+?)(\2)/mi;
      while (assets && (match = assets.match(assetRegExp)) && match.groups) {
        const [input] = match;
        const { index, groups } = match;
        const { pathToAsset } = groups;
        const newPath = workspace &&
          path.join(path.dirname(o3.document.uri), pathToAsset).replace('file:/', 'file:///')
          .replace(`${workspace[0].uri}/`, '');
        if (pathToAsset
          && pathToAsset.startsWith('.')
          && !fs.existsSync(newPath)) {
          this.saveDiagnostics([{
            message: `unreachable file: this file doesn't exist`,
            severity: DiagnosticSeverity.Error,
            range: {
              start: o3.document.positionAt(index),
              end: o3.document.positionAt(index + input.length)
            },
            source: "otone",
          }]);
        } else if (pathToAsset
          && pathToAsset.startsWith('@/')
          && !fs.existsSync(pathToAsset.replace('@/', ''))) {
          this.saveDiagnostics([{
            message: `unreachable file: this file doesn't exist`,
            severity: DiagnosticSeverity.Error,
            range: {
              start: o3.document.positionAt(index),
              end: o3.document.positionAt(index + input.length)
            },
            source: "otone",
          }]);
        }
       assets = assets.replace(assetRegExp, ' '.repeat(input.length))
      }
    }
  }
  protected EOFDiagnostics(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { text } = o3;
      if (!text.endsWith('\n')) {
        this.saveDiagnostics([{
          message: `a line break at the end of the file is required`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(text.length -1),
            end: o3.document.positionAt(text.length)
          },
          source: "otone",
        }]);
      }
      let match;
      if ((match = text.match(/(\n){2,}$/gi))) {
        const [input] = match;
        const { index } = match;
        this.saveDiagnostics([{
          message: `multiple line break at the end of the file`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(index),
            end: o3.document.positionAt(index + input.length)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected requiredLineBreakForProtoAndTemplate(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes, text } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      const lastProtoChild: any = proto
        && proto.childNodes
        && proto.childNodes[proto.childNodes.length - 1];
      const template: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "template");
      const lastTemplateChild: any = template
        && template.childNodes
        && template.childNodes[template.childNodes.length - 1];
      if (proto
        && !text[proto.startIndex -1]?.match(/\n/)
        && proto.startIndex -1 > 0) {
        this.saveDiagnostics([{
          message: `a line break is required before the proto element`,
          severity: DiagnosticSeverity.Warning,
          range: {
            start: o3.document.positionAt(proto.startIndex),
            end: o3.document.positionAt(proto.endIndex + 1)
          },
          source: "otone",
        }]);
      }
      if (template
        && !text[template.startIndex -1]?.match(/\n/)
        && template.startIndex -1 > 0) {
        this.saveDiagnostics([{
          message: `a line break is required before the template element`,
          severity: DiagnosticSeverity.Warning,
          range: {
            start: o3.document.positionAt(template.startIndex),
            end: o3.document.positionAt(template.endIndex + 1)
          },
          source: "otone",
        }]);
      }
      if (lastProtoChild && !text[lastProtoChild.endIndex]?.match(/\n/)) {
        this.saveDiagnostics([{
          message: `a line break is required at the end of the protocol`,
          severity: DiagnosticSeverity.Warning,
          range: {
            start: o3.document.positionAt(lastProtoChild.startIndex),
            end: o3.document.positionAt(lastProtoChild.endIndex + 1)
          },
          source: "otone",
        }]);
      }
      if (lastTemplateChild
            && !(lastTemplateChild.nodeType === 3
              && lastTemplateChild.data.match(/\n$/gi))) {
        this.saveDiagnostics([{
          message: `a line break is required after this element`,
          severity: DiagnosticSeverity.Warning,
          range: {
            start: o3.document.positionAt(lastTemplateChild.startIndex),
            end: o3.document.positionAt(lastTemplateChild.endIndex + 1)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected getForbiddenTemplate(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      const template: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "template");
      if (proto && template && ['controller'].includes(proto.attribs.type)) {
        this.saveDiagnostics([{
          message: `template element is not allowed in ${proto.attribs.type} components`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(template.startIndex),
            end: o3.document.positionAt(template.endIndex + 1)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected getUselessTemplate(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const template: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "template");
      if (template
        && (!template.attribs.is
          || !template.attribs.is.length)
        && (!template.childNodes.length
          || template.childNodes.length === 1
          && template.childNodes[0].nodeType === 3
          && !template.childNodes[0].data.trim().length)) {
        this.saveDiagnostics([{
          message: `empty template`,
          severity: DiagnosticSeverity.Warning,
          range: {
            start: o3.document.positionAt(template.startIndex),
            end: o3.document.positionAt(template.endIndex + 1)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected inspectRequiredProtocolNamespace(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      if (proto
        && ['controller', 'store'].includes(proto.attribs.type)
        && (proto.attribs.namespace === undefined || !proto.attribs.namespace.length)) {
        this.saveDiagnostics([{
          message: `namespace is required for ${proto.attribs.type} components`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(proto.startIndex),
            end: o3.document.positionAt(proto.endIndex + 1)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected inspectUselessTemplateAttrs(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const validAttributes = this.validTemplateAttributes;
      const template: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "template");
      if (template) {
        const keys = Object.keys(template.attribs);
        keys
          .filter(key => !validAttributes.includes(key))
          .map((key) => {
            const attribute = template.attributesMap.get(key);
            this.saveDiagnostics([{
              message: `template attribute '${key}' is not supported, 'is' attribute is supported`,
              severity: DiagnosticSeverity.Error,
              range: {
                start: o3.document.positionAt(attribute.position.start),
                end: o3.document.positionAt(attribute.position.start + key.length)
              },
              source: "otone",
            }]);
          });
      }
    }
  }
  protected inspectUselessProtocolAttrs(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const validAttributes = this.validProtocolAttributes;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      if (proto) {
        const keys = Object.keys(proto.attribs);
        keys
          .filter(key => !validAttributes.includes(key)
            && (['conroller', 'store'].includes(proto.attribs.type) && key !== 'namespace')
            || (!['conroller', 'store'].includes(proto.attribs.type) && !validAttributes.includes(key)))
          .map((key) => {
            const attribute = proto.attributesMap.get(key);
            this.saveDiagnostics([{
              message: `protocol attribute '${key}' is not supported`,
              severity: DiagnosticSeverity.Error,
              range: {
                start: o3.document.positionAt(attribute.position.start),
                end: o3.document.positionAt(attribute.position.end)
              },
              source: "otone",
            }]);
          });
      }
    }
  }
  protected inspectProtocolTypes(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      if (proto && proto.attribs.type && proto.attribs.type.length && !this.supportedTypes.includes(proto.attribs.type)) {
        this.saveDiagnostics([{
          message: `protocol type ${proto.attribs.type} is not supported`,
          severity: DiagnosticSeverity.Error,
          range: {
            start: o3.document.positionAt(proto.startIndex),
            end: o3.document.positionAt(proto.startIndex + 6)
          },
          source: "otone",
        }]);
      }
    }
  }
  protected inspectForbiddenElementInsideProto(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const proto: any = nodes.find((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === "proto");
      if (proto) {
        proto.childNodes
            .filter((n: any) => n.nodeType === 1)
            .map((n: any) => {
              this.saveDiagnostics([{
                message: `unsupported <${n.tagName}> found inside <proto>`,
                severity: DiagnosticSeverity.Error,
                range: {
                  start: o3.document.positionAt(n.startIndex),
                  end: o3.document.positionAt(n.endIndex + 1)
                },
                source: "otone",
              }]);
            });
      }
    }
  }
  protected inspectNoUnknownElementOnTopLevel(document: TextDocument) : void{
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const notAllowedElementsOnTopLevel = nodes.filter((n: any) =>
        n.nodeType === 1
        && !["template", "proto"].includes(n.tagName.toLowerCase())
      );
      if (notAllowedElementsOnTopLevel.length) {
        notAllowedElementsOnTopLevel.forEach((element: any) => {
          this.saveDiagnostics([{
            message: `${element.tagName} has to be inserted into the template, as it is not supported on top level. template (XML), proto (typescript) are supported`,
            severity: DiagnosticSeverity.Error,
            range: {
              start: o3.document.positionAt(element.startIndex),
              end: o3.document.positionAt(element.endIndex + 1)
            },
            source: "otone",
          }]);
        })
      }
    }
  }
  protected inspectForbiddenDuplication(document: TextDocument): void {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const protos = nodes.filter((node: any) => node.tagName && node.tagName.toLowerCase() === "proto")
      const templates = nodes.filter((node: any) => node.tagName && node.tagName.toLowerCase() === "template")
      if (protos.length > 1) {
        protos.forEach((proto) => {
          this.saveDiagnostics([{
            severity: DiagnosticSeverity.Error,
            message: `Cannot set multiple protocol`,
            range: {
              start: o3.document.positionAt(proto.startIndex),
              end: o3.document.positionAt(proto.endIndex + 1)
            },
            source: 'otone',
          }]);
        });
      }
      if (templates.length > 1) {
        templates.forEach((template) => {
          this.saveDiagnostics([{
            severity: DiagnosticSeverity.Error,
            message: `Cannot set multiple template`,
            range: {
              start: o3.document.positionAt(template.startIndex),
              end: o3.document.positionAt(template.endIndex + 1)
            },
            source: 'otone',
          }]);
        });
      }
    }
  }
  protected inspectForbiddenTextnodes(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      const { nodes } = o3;
      const forbiddenTextNodes = nodes.filter((node, id) =>
        node.nodeType === 3
        && id !== 0
        && (node as any).nodeValue.trim().length
      );
      forbiddenTextNodes.forEach((node) => {
        if ((node as any).nodeValue && (node as any).nodeValue.trim().length) {
          this.saveDiagnostics([
            {
              severity: DiagnosticSeverity.Error,
              message: `forbidden textnode: ${(node as any).nodeValue}`,
              range: {
                start: o3.document.positionAt(node.startIndex),
                end: o3.document.positionAt(node.endIndex + 1)
              },
              source: 'otone',
            }
          ]);
        }
      });
    }
  }
  protected updateDocument(document: TextDocument) {
    const o3 = this.getItem(document.uri);
    if (o3) {
      o3.text = document.getText();
      o3.nodes = this.render(o3.text);
      o3.assets = this.getAssets(o3.nodes);
      o3.encodedText = this.encode(o3.text);
      o3.encodedNodes =  this.render(o3.encodedText);
      this.syncNodes(document.uri);
    }
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
    return firstNode && firstNode.nodeType === 3 ? (nodes[0] as any).nodeValue : null
  }
}