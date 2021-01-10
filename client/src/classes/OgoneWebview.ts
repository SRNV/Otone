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
  window,
  WindowState,
  WebviewPanel,
  ViewColumn,
  Uri,
  ExtensionContext,
  TextEditor,
} from 'vscode';
import OgoneDocument from './OgoneDocument';
import Workers from '../ogone/workers';
import * as path from 'path';
import { Webview } from '../enums/templateWebview';
import * as Websocket from 'ws';
import OgoneWebsocket from './OgoneWebsocket';

export interface OgoneWebviewConstructorOptions {
  context: ExtensionContext;
  files: Uri[];
}
/**
 * @name OgoneWebview
 * @description
 *  this class should provide a view of the component
 */
export default class OgoneWebview extends OgoneDocument {
  public panel?: WebviewPanel;
  informations: any = {};
  files: Uri[];
  port: number = Math.floor(Math.random() * 9000 + 2000);
  context: ExtensionContext;
  transparentBackgroundPath: Uri;
  iconPath: Uri;
  transparentBackgroundSpecialUri: string;
  ogoneLogoSpecialUri: string;
  updateComponentTimeout: any = 0;
  ws?: Websocket;
  FIFOMessages: string[] = [];
  constructor(opts: OgoneWebviewConstructorOptions) {
    super();
    const { context, files } = opts;
    const updateWebview = (document) => {
      this.updateWebview();
    };
    this.context = context;
    this.files = files;
    // define all the uri needed
    this.transparentBackgroundPath = Uri.file(
      path.join(context.extensionPath, 'public', 'transparent_back.png')
    );
    this.iconPath = Uri.file(
      path.join(context.extensionPath, 'public', 'ogone-svg.png')
    );
    this.transparentBackgroundSpecialUri = context.asAbsolutePath(
      path.join('public', 'transparent_back.png')
    );
    this.ogoneLogoSpecialUri = context.asAbsolutePath(
      path.join('public', 'ogone-svg.png')
    );
    // start websocket connection
    const _self = this;
    OgoneWebsocket.server.on('connection', (ws) => {
      _self.ws = ws;
      _self.FIFOMessages.forEach((m) => {
        ws.send(m);
      })
      _self.FIFOMessages.splice(0);
      ws.on('message', (message) => {
        _self.read(message);
      });
    });
    OgoneWebsocket.errorServer.on('connection', (ws) => {
      ws.on('message', (message) => {
        _self.readError(message);
      })
    })
    window.onDidChangeWindowState(updateWebview);
    window.onDidChangeVisibleTextEditors(updateWebview);
    window.onDidChangeTextEditorSelection((ev) => {
      const { document } = ev.textEditor;
      if (!document.uri.path.endsWith('.o3')) {
        this.showWelcomeMessage();
        return;
      }
      if (document.uri.path !== this.document.uri.path) {
        this.setDocument(document);
        this.updateWebview();
      }
    });
  }
  get welcomeMessage() {
    return `
    <p align="center">
      <img src="vscode-resource:${this.ogoneLogoSpecialUri}" />
    </p>
    ${Webview.WELCOME_MESSAGE}
    `;
  }
  readError(message: Websocket.Data): void {
    if (message) {
      const data = JSON.parse(message as string);
      window.showErrorMessage(message as string);
      console.warn(data);
    }
  }
  read(message: Websocket.Data): void {
    if (message) {
      const data = JSON.parse(message as string);
      console.warn(data);
      switch (data.type) {
        case Workers.LSP_CLOSE:
          this.panel.webview.html = this.welcomeMessage;
          this.panel.dispose();
          break;
        case Workers.LSP_SEND_COMPONENT_INFORMATIONS:
          this.informations[data.data.file] = data.data;
          break;
        case Workers.LSP_OPEN_WEBVIEW:
          this.openWebview();
          break;
        case Workers.LSP_SEND_PORT:
          this.port = data.data;
          this.setViewForActiveOgoneDocument();
          this.openWebview()
          break;
        case Workers.LSP_CURRENT_COMPONENT_RENDERED:
          this.panel.webview.html = this.getHTML(data.data);
          this.openWebview()
          break;
      }
    }
  }
  notify(type: any, message: Object | string | number) {
    const data = {
      type: type || 'message',
      data: message
    };
    if (this.ws) {
      this.ws.send(JSON.stringify(data));
    } else {
      this.FIFOMessages.push(JSON.stringify(data))
    }
  }
  openWebview() {
    if (!this.panel) {
      const activeEditor = this.getActiveEditor();
      this.panel = window.createWebviewPanel(
        workspace.name , // Identifies the type of the webview. Used internally
        `Ogone Designer - ${workspace.name}`, // Title of the panel displayed to the user
        {
          viewColumn: activeEditor && activeEditor.viewColumn ? activeEditor.viewColumn + 1 : ViewColumn.Two,
          preserveFocus: true,
        }, // Editor column to show the new webview panel in.
        {
          enableScripts: true,
          localResourceRoots: [Uri.file(path.join(this.context.extensionPath, 'public'))]
        } // Webview options. More on these later.
      );
      this.showWelcomeMessage();
      this.panel.iconPath = this.iconPath;
      this.setViewForActiveOgoneDocument();
      this.panel.onDidDispose(() => {
        this.panel = null;
        const activeEditor = this.getActiveEditor();
        if (activeEditor) {
          this.openWebview();
        }
      });
    }
  }
  translateWebview() {
    const activeEditor = this.getActiveEditor();
    if (activeEditor) {
      if (this.panel.viewColumn <= activeEditor.viewColumn) {
        this.panel.dispose();
      }
    }
  }
  updateWebview() {
    this.translateWebview();
    this.openWebview()
    if (!this.panel.visible) {
      this.panel.reveal(ViewColumn.Two);
    }
    if (this.document.uri.path.endsWith('.o3')) {
      clearTimeout(this.updateComponentTimeout as any);
      this.updateComponentTimeout = setTimeout(() => {
        this.notify(Workers.LSP_UPDATE_CURRENT_COMPONENT, {
          ...this.document.uri,
          text: this.document.getText(),
        });
      }, 500);
    }
  }
  closeWebview() {
    this.panel.dispose();
  }
  setViewForActiveOgoneDocument() {
    const active = this.getActiveEditor();
    if (active) {
      this.document = active.document;
      this.notify(Workers.LSP_UPDATE_CURRENT_COMPONENT, {
        ...this.document.uri,
        text: this.document.getText(),
      });
    }
  }
  getActiveEditor(): TextEditor | undefined {
    const { visibleTextEditors } = window;
    const active = visibleTextEditors.find((editor) => editor.document
      && editor.document.uri.fsPath.endsWith('.o3'));
    return active;
  }
  showWelcomeMessage() {
    this.panel.webview.html = this.welcomeMessage;
  }
  getHTML(inside: string) {
    // And get the special URI to use with the webview
    return `
    <style>
      body {
        background: #333;
        padding: 0px;
        height: 100vh;
        width: 100vw;
        overflow: hidden;
      }
      iframe {
        width: 100%;
        height: 100%;
        border: 0px;
        background: url("vscode-resource:${this.transparentBackgroundSpecialUri}") !important;
        background-image: url("vscode-resource:${this.transparentBackgroundSpecialUri}") !important;
      }
      .wbv_container {
        height: 100%;
        grid-template-areas:
          "viewer viewer viewer"
          "viewer viewer viewer"
          "status status status";
        display: grid;
        grid-template-rows: 2fr 2fr minmax(min-content, min-content);
        grid-template-columns: 2fr 2fr 1fr;
      }
      .wbv_status {
        grid-area: status;
      }
      .wbv_viewer {
        grid-area: viewer;
        display: flex;
      }
    </style>
    <div class="wbv_container">
      <div class="wbv_status">
        <span style="display: none">${Date.now()}</span>${this.document.uri.path} - ${this.files.length} components in the workspace
      </div>
      <div class="wbv_viewer">
        <iframe
          allowtransparency="true"
          id="viewer"
          src="http://localhost:${this.port}/?component=${this.document.uri.path}&port=${this.port}"></iframe>
      </div>
    </div>
    `
  }
}