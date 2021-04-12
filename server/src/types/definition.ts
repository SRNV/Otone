import { parseDOM } from "htmlparser2";
import { TextDocument } from "vscode-languageserver-textdocument";

export interface O3Document {
  nodes: ReturnType<typeof parseDOM>;
  text: string;
  encodedText: string;
  encodedNodes: ReturnType<typeof parseDOM>;
  document: TextDocument;
  assets: string | null;
}