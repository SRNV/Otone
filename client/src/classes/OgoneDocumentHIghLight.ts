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

export interface OgoneDocumentHighLightConstructorOptions {
}
export default class OgoneDocumentHighLight extends OgoneDocument {
  constructor(opts: OgoneDocumentHighLightConstructorOptions) {
    super();
  }
  provideDocumentHighlights (document: TextDocument, position: Position) {
    this.setDocument(document);
    return this.getDocumentHighLights(position)
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
}