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
export default abstract class OgoneDocument {
  protected document: TextDocument;
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
  public getCompleteCSS(): string {
    let result = ``;
    const styles = this.styleNodes.filter((n: any) => n.nodeType === 1 && n.tagName.toLowerCase() === 'style');
    styles.forEach((node: any) => {
      if (!node.childNodes.length) return;
      const [textnode] = node.childNodes;
      // add white spaces before css text
      result += ' '.repeat(textnode.startIndex - result.length);
      // add the css text
      result += textnode.data;
    });
    return result;
  }
}