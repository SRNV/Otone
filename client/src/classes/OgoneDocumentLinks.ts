import {
  DocumentLink,
  ProviderResult,
  TextDocument,
  languages,
  workspace,
  Position,
  DocumentHighlight,
  ColorInformation,
  Color,
  ColorPresentation,
  Range,
} from 'vscode';
import * as path from 'path';
import OgoneDocument from './OgoneDocument';

export interface OgoneDocumentLinksConstructorOptions {
}
export default class OgoneDocumentLinks extends OgoneDocument {
  constructor(opts: OgoneDocumentLinksConstructorOptions) {
    super();
  }
  provideDocumentLinks(document: TextDocument) {
    this.setDocument(document);
    return this.getDocumentLinks();
  }
  getDocumentLinks(): ProviderResult<DocumentLink[]> {
    try {
      let documentLinkProviders = [
        ...this.getRelativeLinks(),
        ...this.getAbsoluteLinks(),
      ];
      return documentLinkProviders;
    } catch(e) {
      console.error(e);
    }
  }
  getRelativeLinks(): DocumentLink[] {
    const { document } = this;
    let documentLinkProviders = [];
    const relativeLink = /(use\s+)(\..+?\.o3)(\s+as\s+)(['"])(.*?)(?<!\\)(\4)(\;){0,1}([\n\s])*/gi;
    let text: string = (this.assetNode as any).nodeValue;
    let m = text.match(relativeLink);
    function pushLink(target: string, start: number, end: number) {
      documentLinkProviders.push({
        range: {
          start: document.positionAt(start),
          end: document.positionAt(end),
        },
        target,
      });
    }
    if (!m) return [];
    let index = 0;
    m.forEach((useStatement) => {
      if (text.indexOf(useStatement, index) > -1) {
        if (index === 0) index += text.indexOf(useStatement);
        const match = useStatement.match(/(use\s+)(\..+?\.o3)(\s+as\s+)(['"])(.*?)(?<!\\)(\4)(\;){0,1}([\n\s])*/);
        if (match) {
          // @ts-ignore
          let [input, use, link, as, str, tagName] = match;
          this.AllNodes
            .filter((n: any) => {
              return n.nodeType === 1 && n.tagName === tagName
            })
            .map((n: any) => {
              pushLink(
                path.normalize(path.resolve(document.uri.path, `./../${link}`)),
                n.startIndex + 1,
                n.startIndex + tagName.length + 1
              );
            });
          pushLink(
            path.normalize(path.resolve(document.uri.path, `./../${link}`)),
            index + use.length,
            index + use.length + link.length
          );
          index += input.length;
        }
      }
    });
    return documentLinkProviders;
  }
  getAbsoluteLinks(): DocumentLink[] {
    const { document } = this;
    let documentLinkProviders = []
    const absoluteLink = /(use\s+)(\@)(\/[^\s\n]+\.o3)(\s+as\s+)(['"])(.*?)(?<!\\)(\5)(\;){0,1}([\n\s])*/gi;
    let text = (this.assetNode as any).nodeValue;
    let m = text.match(absoluteLink);
    function pushLink(target: string, start: number, end: number) {
      documentLinkProviders.push({
        range: {
          start: document.positionAt(start),
          end: document.positionAt(end),
        },
        target,
      });
    }
    if (!m) return [];
    let index = 0;
    m.forEach((useStatement) => {
      if (text.indexOf(useStatement, index) > -1) {
        if (index === 0) index += text.indexOf(useStatement);
        const match = useStatement.match(/(use\s+)(\@)(\/[^\s\n]+\.o3)(\s+as\s+)(['"])(.*?)(?<!\\)(\5)(\;){0,1}([\n\s])*/);
        if (match) {
          console.warn(match);
          // @ts-ignore
          let [input, use, at, link, as, str, tagName] = match;
          this.AllNodes
            .filter((n: any) => {
              return n.nodeType === 1 && n.tagName === tagName
            })
            .map((n: any) => {
              pushLink(
                path.join(workspace.workspaceFolders[0].uri.path, link),
                n.startIndex + 1,
                n.startIndex + tagName.length + 1
              );
            });
          pushLink(
            path.join(workspace.workspaceFolders[0].uri.path, link),
            index + use.length,
            index + use.length + link.length + 1
          );
          index += input.length;
        }
      }
    });
    return documentLinkProviders;
  }
}