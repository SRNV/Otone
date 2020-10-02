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
import * as HTMLParser from 'htmlparser2';

export interface OgoneClientConstructorOptions {
}
export default class OgoneClient {
  private document: TextDocument;
  constructor(opts: OgoneClientConstructorOptions) {
    // get links for the use statement
    languages.registerDocumentLinkProvider('ogone', {
      provideDocumentLinks: (document: TextDocument) => {
        this.setDocument(document);
        return this.getDocumentLinks();
      }
    });
    // get highlights
    languages.registerDocumentHighlightProvider('ogone', {
      provideDocumentHighlights: (document: TextDocument, position: Position) => {
        this.setDocument(document);
        return this.getDocumentHighLights(position)
      }
    });
    // get colors inside component
    // this.provide a way to use a color picker
    languages.registerColorProvider('ogone', {
      provideDocumentColors: (document: TextDocument) => {
        this.setDocument(document);
        return this.getDocumentColors();
      },
      provideColorPresentations: (color: Color, { document, range }: { document: TextDocument, range: Range }) => {
        this.setDocument(document);
        return this.getDocumentColorsPresentation( { color, range });
      }
    })
  }
  get nodes() {
    return HTMLParser.parseDOM(this.document.getText(), {
      withStartIndices: true,
      withEndIndices: true,
      xmlMode: true,
    });
  }
  get text() {
    return this.document.getText();
  }
  get assetNode() {
    return this.nodes.find((node: any, id: number) => node.nodeType === 3 && id === 0);
  }
  get templateNode() {
    return this.nodes.find((node: any) => node.nodeType === 1 && node.tagName.toLowerCase() === 'template');
  }
  get protoNode() {
    return this.nodes.find((node: any) => node.nodeType === 1 && node.tagName.toLowerCase() === 'proto');
  }
  get styleNodes() {
    return this.nodes.filter((node: any) => node.nodeType === 1 && node.tagName.toLowerCase() === 'style');
  }
  get AllNodes() {
    const allNodes = [];
    function recursive(n: any) {
      if (n.nodeType === 1 && n.childNodes) {
        allNodes.push(n);
        n.childNodes.forEach((child) => {
          recursive(child);
        });
      }
    }
    this.nodes.forEach((child) => {
      recursive(child);
    });
    return allNodes;
  }
  setDocument(document: TextDocument) {
    this.document = document;
  }
  getDocumentHighLights(position: Position): ProviderResult<DocumentHighlight[]> {
    let highLights = [];
    const kind = 2;
    const inspectedNode: any = this.AllNodes.reverse().find((node: any) => position.isAfterOrEqual(this.document.positionAt(node.startIndex))
      && position.isBeforeOrEqual(this.document.positionAt(node.endIndex))
    );
    if (inspectedNode) {
      const lastNode = inspectedNode.childNodes[inspectedNode.childNodes.length - 1]
      if (lastNode) {
        const firstNode = inspectedNode.childNodes[0]
        const openingTag = {
          range: new Range(
            this.document.positionAt(inspectedNode.startIndex),
            this.document.positionAt(firstNode.startIndex)
          ),
          kind,
        };
        const closingTag = {
          range: new Range(
            this.document.positionAt(lastNode.endIndex),
            this.document.positionAt(inspectedNode.endIndex + 1)
          ),
          kind,
        }
        highLights.push(openingTag, closingTag);
      } else {
        highLights.push({
          range: new Range(
            this.document.positionAt(inspectedNode.startIndex),
            this.document.positionAt(inspectedNode.endIndex + 1)
          ),
          kind,
        })
      }
    }
    return highLights;
  }
  getDocumentColorsPresentation({ color, range }): ProviderResult<ColorPresentation[]> {
    let presentations = [];
    return presentations;
  }
  getDocumentColors(): ProviderResult<ColorInformation[]> {
    let colors = [
      /*{
        range: new Range(
          document.positionAt(0),
          document.positionAt(document.getText().length)
        ),
        color: new Color(1, 0, 0, 1),
      }*/
    ];

    return colors;
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
		while(m) {
			let { index } = m;
			index = index + previousIndex;
      let [input, use, link, as, str, tagName ] = m;
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
		while(m) {
			let { index } = m;
			index = index + previousIndex;
      let [input, use, at, link, as, str, tagName ] = m;
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