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
      const absoluteLinks = this.getAbsoluteLinks();
      let documentLinkProviders = [
        ...absoluteLinks.links,
      ];
      let documentNodeLinks = [
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
  getAbsoluteLinks(): OgoneDocumentLinkParsingResult {
    const { document } = this;
    let documentLinkProviders: DocumentLink[] = [];
    let documentNodeLinks: OgoneDocumentNodeLink[] = [];
    if (!this.assetNode) return {
      links: documentLinkProviders,
      nodeLinks: documentNodeLinks,
    };
    const absoluteLink = /(import\s+component\s+)(.+?)(\s+from\s+)(['"])(.*?)(?<!\\)(\4)(\;){0,1}([\n\s])*/gi;
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
    m.forEach((useStatement) => {
      const match = useStatement.match(/(import\s+component\s+)(.+?)(\s+from\s+)(['"])(.*?)(?<!\\)(\4)(\;){0,1}([\n\s])*/);
        if (match) {
          // @ts-ignore
          let [input, importStatement, tagName, fr, str, oldPath] = match;
          const isAbsolute = oldPath.startsWith('@');
          const link = isAbsolute ? oldPath.replace(/^@\//, '') : oldPath;
          this.AllNodes
            .filter((n: any) => {
              return n.nodeType === 1 && n.tagName === tagName
            })
            .map((n: any) => {
              pushLink(
                isAbsolute ?
                  path.join(workspace.workspaceFolders[0].uri.path, link) :
                  path.normalize(path.resolve(document.uri.path, `./../${link}`)),
                n.startIndex + 1,
                n.startIndex + tagName.length + 1,
                n
              );
            });
        }
    });
    return {
      links: documentLinkProviders,
      nodeLinks: documentNodeLinks,
    };
  }
}