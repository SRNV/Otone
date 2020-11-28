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
  window
} from 'vscode';
import * as path from 'path';
import OgoneDocument from './OgoneDocument';
import OgoneDocumentLinks from './OgoneDocumentLinks';
import OgoneDocumentHighLight from './OgoneDocumentHIghLight';
import OgoneDocumentColor from './OgoneDocumentColor';
import OgoneDocumentHover from './OgoneDocumentHover';

export interface OgoneClientConstructorOptions {
}
export default class OgoneClient extends OgoneDocument {
  constructor(opts: OgoneClientConstructorOptions) {
    super();
    // get links for the use statement
    languages.registerDocumentLinkProvider('ogone', new OgoneDocumentLinks({}));
    // get highlights
    languages.registerDocumentHighlightProvider('ogone', new OgoneDocumentHighLight({}));
    // get colors inside component
    // this.provide a way to use a color picker
    languages.registerColorProvider('ogone', new OgoneDocumentColor({}));
    // get hovers
    languages.registerHoverProvider('ogone', new OgoneDocumentHover({}));
  }
}