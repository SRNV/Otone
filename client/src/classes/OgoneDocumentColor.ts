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

export interface OgoneDocumentColorConstructorOptions {
}
export default class OgoneDocumentColor extends OgoneDocument {
  constructor(opts: OgoneDocumentColorConstructorOptions) {
    super();
  }
  public provideDocumentColors(document: TextDocument) {
    this.setDocument(document);
    return this.getDocumentColors();
  }
  public provideColorPresentations(color: Color, { document, range }: { document: TextDocument, range: Range }) {
    this.setDocument(document);
    return this.getDocumentColorsPresentation( { color, range });
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
}