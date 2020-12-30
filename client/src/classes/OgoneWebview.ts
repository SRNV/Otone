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
  updateComponentTimeout: any = 0;
  constructor(opts: OgoneWebviewConstructorOptions) {
    super();
    const { context, files } = opts;
    const updateWebview = () => {
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
    // start websocket connection
    const _self = this;
    OgoneWebsocket.server.on('connection', (ws) => {
      OgoneWebsocket.ws = ws;
      OgoneWebsocket.ws.on('message', (message) => {
        _self.read(message);
      });
    });
    window.onDidChangeWindowState(updateWebview);
    window.onDidChangeVisibleTextEditors(updateWebview);
    window.onDidChangeTextEditorSelection((ev) => {
      const { document } = ev.textEditor;
      if (document.uri.path !== this.document.uri.path) {
        this.setDocument(document);
        this.updateWebview();
      }
    })
  }
  read(message: Websocket.Data): void {
    if (message) {
      const data = JSON.parse(message as string);
      switch (data.type) {
        case Workers.LSP_CLOSE:
          this.panel.webview.html = Webview.WELCOME_MESSAGE;
          break;
        case Workers.LSP_SEND_COMPONENT_INFORMATIONS:
          window.showInformationMessage('Ogone Designer - component informations received...');
          this.informations[data.data.file] = data.data;
          break;
        case Workers.LSP_OPEN_WEBVIEW:
          window.showInformationMessage('Ogone Designer - opening...');
          this.openWebview();
          break;
        case Workers.LSP_SEND_PORT:
          window.showInformationMessage('Ogone Designer - get the active document');
          this.port = data.data;
          this.setViewForActiveOgoneDocument();
          this.openWebview()
          break;
        case Workers.LSP_CURRENT_COMPONENT_RENDERED:
          window.showInformationMessage('Ogone Designer - rendering...');
          this.panel.webview.html = this.getHTML(data.data);
          this.openWebview()
          break;
      }
    }
  }
  notify(type: any, message: Object | string | number) {
    if (OgoneWebsocket.ws) {
      OgoneWebsocket.ws.send(JSON.stringify({
        type: type || 'message',
        data: message
      }));
    } else {
      console.warn(4, 'no messages')
    }
  }
  openWebview() {
    if (!this.panel) {
      const activeEditor = this.getActiveEditor();
      this.panel = window.createWebviewPanel(
        'ogone', // Identifies the type of the webview. Used internally
        'Ogone Designer', // Title of the panel displayed to the user
        {
          viewColumn: activeEditor && activeEditor.viewColumn ? activeEditor.viewColumn + 1 : ViewColumn.Two,
          preserveFocus: true,
        }, // Editor column to show the new webview panel in.
        {
          enableScripts: true,
          localResourceRoots: [Uri.file(path.join(this.context.extensionPath, 'public'))]
        } // Webview options. More on these later.
      );
      this.panel.webview.html = Webview.WELCOME_MESSAGE;
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
      }, 200);
    } else {
      console.warn(3, 'nothing here')
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
    } else {
      window.showInformationMessage('nothing appear');
      console.warn(1, 'nothing here')
    }
  }
  getActiveEditor(): TextEditor | undefined {
    const { visibleTextEditors } = window;
    const active = visibleTextEditors.find((editor) => editor.document
      && editor.document.uri.fsPath.endsWith('.o3'));
    if (!active) {
      window.showWarningMessage('nothing appear')
      console.warn(2, 'nothing here')
    }
    return active;
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