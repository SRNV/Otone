import {
  DocumentLink,
  ProviderResult,
  TextDocument,
  languages,
  workspace
} from 'vscode';
import * as path from 'path';

export interface OgoneClientConstructorOptions {
}
export default class OgoneClient {
  constructor(opts: OgoneClientConstructorOptions) {
    languages.registerDocumentLinkProvider('ogone', {
      provideDocumentLinks: (document: TextDocument) => {
        return this.getDocumentLinks(document);
      }
    });
  }
  getDocumentLinks(document: TextDocument): ProviderResult<DocumentLink[]> {
		let documentLinkProviders = [
      ...this.getRelativeLinks(document),
      ...this.getAbsoluteLinks(document),
    ];
		return documentLinkProviders;
  }
  getRelativeLinks(document: TextDocument): DocumentLink[] {
    let documentLinkProviders = [];
    const relativeLink = /(use\s+)(\..+?\.o3)(\s+as\s+)(['"])(.*?)(?<!\\)(\4)(\;){0,1}(\n){0,1}/;
		let text = document.getText();
		let previousIndex = 0;
		let m = relativeLink.exec(text);
		while(m) {
			let { index } = m;
			index = index + previousIndex;
			let [input, use, link, as, str, tagName ] = m;
			documentLinkProviders.push({
				range: {
					start: document.positionAt(index + use.length),
					end: document.positionAt(index + use.length + link.length),
				},
				target: path.normalize(path.resolve(document.uri.path, `./../${link}`)),
			});
			text = text.replace(input, '');
			previousIndex = index + input.length;
			m = relativeLink.exec(text);
    }
    return documentLinkProviders;
  }
  getAbsoluteLinks(document: TextDocument): DocumentLink[] {
    let documentLinkProviders = []
    const absoluteLink = /(use\s+)(\@)(\/[^\s\n]+\.o3)(\s+as\s+)(['"])(.*?)(?<!\\)(\5)(\;){0,1}(\n){0,1}/;
		let text = document.getText();
		let previousIndex = 0;
    let m = absoluteLink.exec(text);
		while(m) {
			let { index } = m;
			index = index + previousIndex;
			let [input, use, at, link, as, str, tagName ] = m;
			documentLinkProviders.push({
				range: {
					start: document.positionAt(index + use.length),
					end: document.positionAt(index + use.length + link.length + 1),
				},
				target: path.join(workspace.workspaceFolders[0].uri.path, link),
			});
			text = text.replace(input, '');
			previousIndex = index + input.length;
			m = absoluteLink.exec(text);
    }
    return documentLinkProviders;
  }
}