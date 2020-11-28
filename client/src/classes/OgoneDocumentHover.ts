import {
  DocumentLink,
  ProviderResult,
  TextDocument,
  languages,
  workspace,
  Position,
  DocumentHighlight,
  ColorInformation,
  HoverProvider,
  Hover,
  Color,
  ColorPresentation,
  Range,
  CancellationToken,
  MarkdownString,
} from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import OgoneDocument from './OgoneDocument';
import OgoneDocumentLinks from './OgoneDocumentLinks';

export interface OgoneDocumentHoverConstructorOptions {
}
export default class OgoneDocumentHover extends OgoneDocument implements HoverProvider {
  constructor(opts: OgoneDocumentHoverConstructorOptions) {
    super();
  }
  public provideHover(document: TextDocument, position: Position, token: CancellationToken) {
    this.setDocument(document);
    return this.getDocumentOverviews(position);
  }
  getDocumentOverviews(position: Position): ProviderResult<Hover> {
    const links = OgoneDocumentLinks.mapLinks.get(this.document.uri.toString());
    let hover: Hover = {
      contents: [],
      range: new Range(new Position(0, 0), new Position(0, 0)),
    };
    if (links) {
      const visitedNode = links.find((nodeLink) => {
        const nodePositionStart = this.document.positionAt(nodeLink.node.startIndex);
        const nodePositionEnd = this.document.positionAt(nodeLink.node.endIndex);
        return position.isAfterOrEqual(nodePositionStart) && position.isBeforeOrEqual(nodePositionEnd);
      })
      if (!!visitedNode) {
        const pathToComponent = visitedNode.link.target.path;
        const fileContent = fs.readFileSync(pathToComponent, { encoding: 'utf8' });
        const fileCode = new MarkdownString();
        fileCode.appendMarkdown(`## ${visitedNode.node.tagName}
_${path.relative(this.document.uri.path, pathToComponent)}_`);
        fileCode.appendCodeblock(fileContent, 'ogone');
        hover.contents.push(fileCode);
        hover.range = new Range(
          this.document.positionAt(visitedNode.node.startIndex),
          this.document.positionAt(visitedNode.node.endIndex),
        )
      }
    }
    return hover;
  }
}