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
    let documentLinkProviders = [
      ...this.getRelativeLinks(),
      ...this.getAbsoluteLinks(),
    ];
    return documentLinkProviders;
  }
  getRelativeLinks(): DocumentLink[] {
    const { document } = this;
    let documentLinkProviders = [];
    const relativeLink = /(use\s+)(\..+?\.o3)(\s+as\s+)(['"])(.*?)(?<!\\)(\4)(\;){0,1}(\n){0,1}/;
    let text = document.getText();
    let previousIndex = 0;
    let m = relativeLink.exec(text);
    let textTagname = text;
    function pushLink(target: string, start: number, end: number) {
      documentLinkProviders.push({
        range: {
          start: document.positionAt(start),
          end: document.positionAt(end),
        },
        target,
      });
    }
    while (m) {
      let { index } = m;
      index = index + previousIndex;
      let [input, use, link, as, str, tagName] = m;
      let tagNameRegExp = new RegExp(`\<${tagName.replace(/(\-)/gi, '\\$1')}`);
      let mt = tagNameRegExp.exec(textTagname);
      while (mt) {
        const [inputTagName] = mt;
        const { index: indexTagName } = mt;
        pushLink(
          path.normalize(path.resolve(document.uri.path, `./../${link}`)),
          indexTagName + 1,
          indexTagName + inputTagName.length
        );
        textTagname = textTagname.replace(inputTagName, inputTagName.split('').map(p => ' ').join(''))
        mt = tagNameRegExp.exec(textTagname);
      }
      pushLink(
        path.normalize(path.resolve(document.uri.path, `./../${link}`)),
        index + use.length,
        index + use.length + link.length
      );
      text = text.replace(input, '');
      previousIndex = index + input.length;
      m = relativeLink.exec(text);
    }
    return documentLinkProviders;
  }
  getAbsoluteLinks(): DocumentLink[] {
    const { document } = this;
    let documentLinkProviders = []
    const absoluteLink = /(use\s+)(\@)(\/[^\s\n]+\.o3)(\s+as\s+)(['"])(.*?)(?<!\\)(\5)(\;){0,1}(\n){0,1}/;
    let text = document.getText();
    let previousIndex = 0;
    let m = absoluteLink.exec(text);
    let textTagname = text;
    function pushLink(target: string, start: number, end: number) {
      documentLinkProviders.push({
        range: {
          start: document.positionAt(start),
          end: document.positionAt(end),
        },
        target,
      });
    }
    while (m) {
      let { index } = m;
      index = index + previousIndex;
      let [input, use, at, link, as, str, tagName] = m;
      let tagNameRegExp = new RegExp(`\<${tagName.replace(/(\-)/gi, '\\$1')}\\b`);
      let mt = tagNameRegExp.exec(textTagname);
      while (mt) {
        const [inputTagName] = mt;
        const { index: indexTagName } = mt;
        pushLink(
          path.join(workspace.workspaceFolders[0].uri.path, link),
          indexTagName + 1,
          indexTagName + inputTagName.length
        );
        textTagname = textTagname.replace(inputTagName, inputTagName.split('').map(p => ' ').join(''))
        mt = tagNameRegExp.exec(textTagname);
      }
      pushLink(
        path.join(workspace.workspaceFolders[0].uri.path, link),
        index + use.length,
        index + use.length + link.length + 1
      );
      text = text.replace(input, '');
      previousIndex = index + input.length;
      m = absoluteLink.exec(text);
    }
    return documentLinkProviders;
  }
}