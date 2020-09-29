import { TextDocument } from "vscode-languageserver-textdocument";

export interface O3Document {
  node: any;
  text: string;
  document: TextDocument
}