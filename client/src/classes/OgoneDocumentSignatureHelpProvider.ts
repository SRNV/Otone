import {
  DocumentLink,
  ProviderResult,
  TextDocument,
  languages,
  workspace,
  Position,
  DocumentHighlight,
  ColorInformation,
  SignatureHelpProvider,
  Color,
  ColorPresentation,
  Range,
  CancellationToken,
  SignatureHelp,
  MarkdownString,
  SignatureHelpContext,
  SignatureInformation,
} from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import OgoneDocument from './OgoneDocument';

export interface OgoneDocumentSignatureHelpProviderOptions {
}
export default class OgoneDocumentSignatureHelpProvider extends OgoneDocument implements SignatureHelpProvider {
  constructor(opts: OgoneDocumentSignatureHelpProviderOptions) {
    super();
  }
  public provideSignatureHelp(document: TextDocument, position: Position, token: CancellationToken, context: SignatureHelpContext) {
    this.setDocument(document);
    return this.getDocumentSignatureHelp(position);
  }
  getDocumentSignatureHelp(position: Position): ProviderResult<SignatureHelp> {
    const signature = new SignatureInformation('ogone signature', 'documentation');
    const signatureHelp: SignatureHelp = {
      signatures: [signature],
      activeSignature: 10,
      activeParameter: 10,
    }
    return signatureHelp;
  }
}