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
  Uri,
  ColorPresentation,
  Range,
  DocumentLinkProvider,
} from 'vscode';
import * as path from 'path';
import OgoneDocument from './OgoneDocument';

export interface OgoneDocumentLinksConstructorOptions {}
export interface OgoneDocumentNodeLink {
  link: DocumentLink;
  node: any;
}
export interface OgoneDocumentLinkParsingResult {
  links: DocumentLink[];
  nodeLinks: OgoneDocumentNodeLink[]
};
export default class OgoneDocumentLinks extends OgoneDocument implements DocumentLinkProvider {
  static mapLinks: Map<string, OgoneDocumentNodeLink[]> = new Map();
  constructor(opts: OgoneDocumentLinksConstructorOptions) {
    super();
  }
  provideDocumentLinks(document: TextDocument) {
    OgoneDocumentLinks.mapLinks.set(document.uri.toString(), []);
    this.setDocument(document);
    return this.getDocumentLinks();
  }
  getDocumentLinks(): ProviderResult<DocumentLink[]> {
    try {
      const relativeLinks = this.getRelativeLinks();
      const absoluteLinks = this.getAbsoluteLinks();
      let documentLinkProviders = [
        ...relativeLinks.links,
        ...absoluteLinks.links,
      ];
      let documentNodeLinks = [
        ...relativeLinks.nodeLinks,
        ...absoluteLinks.nodeLinks,
      ];
      // save the node links in the mapLinks
      const item = OgoneDocumentLinks.mapLinks.get(this.document.uri.toString());
      if (item) {
        const candidatesLinks: OgoneDocumentNodeLink[] = documentNodeLinks.filter((candidate) => !item.find((link) => link.link.target === candidate.link.target));
        item.push(...candidatesLinks);
      }
      return documentLinkProviders;
    } catch(e) {
      console.error(e);
    }
  }
  getRelativeLinks(): OgoneDocumentLinkParsingResult {
    const { document } = this;
    let documentLinkProviders: DocumentLink[] = [];
    let documentNodeLinks: OgoneDocumentNodeLink[] = [];
    const relativeLink = /(use\s+)(\..+?\.o3)(\s+as\s+)(['"])(.*?)(?<!\\)(\4)(\;){0,1}([\n\s])*/gi;
    let text: string = (this.assetNode as any).nodeValue;
    let m = text.match(relativeLink);
    function pushLink(target: string, start: number, end: number, node?: any) {
      const candidate = new DocumentLink(
        new Range(document.positionAt(start), document.positionAt(end)),
        Uri.file(target)
      );
      documentLinkProviders.push(candidate);
      if (node) {
        documentNodeLinks.push({
          node,
          link: candidate,
        });
      }
    }
    if (!m) return {
      links: documentLinkProviders,
      nodeLinks: documentNodeLinks,
    };
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
                n.startIndex + tagName.length + 1,
                n
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
    return {
      links: documentLinkProviders,
      nodeLinks: documentNodeLinks,
    };
  }
  getAbsoluteLinks(): OgoneDocumentLinkParsingResult {
    const { document } = this;
    let documentLinkProviders: DocumentLink[] = [];
    let documentNodeLinks: OgoneDocumentNodeLink[] = [];
    const absoluteLink = /(use\s+)(\@)(\/[^\s\n]+\.o3)(\s+as\s+)(['"])(.*?)(?<!\\)(\5)(\;){0,1}([\n\s])*/gi;
    let text = (this.assetNode as any).nodeValue;
    let m = text.match(absoluteLink);
    function pushLink(target: string, start: number, end: number, node?: any) {
      const candidate = new DocumentLink(
        new Range(document.positionAt(start), document.positionAt(end)),
        Uri.file(target)
      );
      documentLinkProviders.push(candidate);
      if (node) {
        documentNodeLinks.push({
          node,
          link: candidate,
        });
      }
    }
    if (!m) return {
      links: documentLinkProviders,
      nodeLinks: documentNodeLinks,
    };
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
                n.startIndex + tagName.length + 1,
                n
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
    return {
      links: documentLinkProviders,
      nodeLinks: documentNodeLinks,
    };
  }
}