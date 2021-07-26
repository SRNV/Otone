import { parseDOM } from "htmlparser2";
import { TextDocument } from "vscode-languageserver-textdocument";
import { Diagnostic, Position } from "vscode-languageserver-types";

export interface ModifierDescription {
  name: string;
  /**
   * argument following the name of the modifier
   * case statements for exemple
   */
  args: string;
  /**
   * the position of the whole modifier
   */
  position: {
    start: number;
    end: number;
  };
  /**
   * the value of the modifier
   */
  content: string;
  /**
   * all the modifier, name included
   */
  source: string;
}
export interface ModifierSourceTSPositions {
  modifier: ModifierDescription;
  content: string;
  visible?: boolean;
  position: {
    start: number;
    end: number;
    offset ?: number;
  }
}
export interface O3Document {
  nodes: ReturnType<typeof parseDOM>;
  text: string;
  encodedText: string;
  encodedNodes: ReturnType<typeof parseDOM>;
  document: TextDocument;
  assets: string | null;
  protocolOpeningSpacesAmount: number;
  modifiers: ModifierDescription[];
  diagnostics: Diagnostic[];
}
export interface NodeSourceTSPositions {
  node: any;
  content: string;
  visible?: boolean;
  position: {
    start: number;
    end: number;
    offset ?: number;
  }
}
export interface AttributeSourceTSPositions {
  attribute: any;
  content: string;
  visible?: boolean;
  position: {
    start: number;
    end: number;
  }
}