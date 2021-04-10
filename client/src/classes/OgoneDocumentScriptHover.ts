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
  import jsdoc from 'jsdoc-api';
  import * as path from 'path';
  import * as fs from 'fs';
  import * as ts from 'typescript';
  import OgoneDocument from './OgoneDocument';
  import OgoneDocumentLinks from './OgoneDocumentLinks';

  export interface OgoneDocumentScriptHoverConstructorOptions {
  }
  export default class OgoneDocumentScriptHover extends OgoneDocument implements HoverProvider {
    constructor(opts: OgoneDocumentScriptHoverConstructorOptions) {
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
      console.warn(links);
      if (links) {
        const visitedNode = links.find((nodeLink) => {
          const nodePositionStart = this.document.positionAt(nodeLink.node.startIndex);
          const nodePositionEnd = this.document.positionAt(nodeLink.node.startIndex + nodeLink.node.tagName.length + 1);
          return position.isAfterOrEqual(nodePositionStart) && position.isBeforeOrEqual(nodePositionEnd);
        })
      }
      return hover;
    }
  }