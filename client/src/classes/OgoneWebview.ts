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
import * as http from 'http';
import axios from 'axios';
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
  updateTimeout?: ReturnType<typeof setTimeout>;
  timeoutUpdateWebview?: ReturnType<typeof setTimeout>;
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
  activated = false;
  server: http.Server;
  constructor(opts: OgoneWebviewConstructorOptions) {
    super();
    const { context, files } = opts;
    const updateWebview = (document) => {
      if (document.uri.path.endsWith('.o3')) {
        this.setDocument(document);
      }
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
    // start heart beat
    window.onDidChangeVisibleTextEditors(updateWebview);
    window.onDidChangeTextEditorSelection((ev) => {
      const { document } = ev.textEditor;
      if (!document.uri.path.endsWith('.o3')) {
        this.showWelcomeMessage();
        return;
      }
      if (document.uri.path !== this.document.uri.path) {
        this.setDocument(document);
      }
    });
  }
  get httpPort(): number {
    return this.port + 1;
  }
  get welcomeMessage() {
    return `
    <p align="center">
      <img src="vscode-resource:${this.ogoneLogoSpecialUri}" />
    </p>
    ${Webview.WELCOME_MESSAGE}
    `;
  }
  setDocument(document: TextDocument) {
    this.document = document;
    this.updateWebview();
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
  async openWebview() {
    const res = await axios.get('http://localhost:5330/hse/live');
    if (res.status !== 200) {
      window.showErrorMessage('Otone - to start HSE session, please run your application.');
      return;
    }
    const resPort = await axios.get('http://localhost:5330/hse/port');
    this.port = resPort.data;
    this.openServer();
    if (this.panel) {
      this.panel.dispose();
      this.panel = null;
    }
    this.panel = window.createWebviewPanel(
      workspace.name + Math.random(), // Identifies the type of the webview. Used internally
      `Otone HSE - ${workspace.name}`, // Title of the panel displayed to the user
      {
        viewColumn: ViewColumn.Two,
        preserveFocus: true,
      }, // Editor column to show the new webview panel in.
      {
        enableScripts: true,
        localResourceRoots: [Uri.file(path.join(this.context.extensionPath, 'public'))]
      } // Webview options. More on these later.
    );
    this.panel.webview.html = this.getHTML();
    this.panel.iconPath = this.iconPath;
    this.setViewForActiveOgoneDocument();
  }
  async updateWebview() {
    if (!this.panel) {
      return;
    }
    if (this.document) {
      await axios.post('http://localhost:5330/hse/update', {
        ...this.document.uri,
        text: this.document.getText(),
      });
    }
  }
  openServer() {
    this.server = http.createServer((req, res) => {
      if (this.panel
        && this.document.uri.path.endsWith('.o3')) {
        this.panel.webview.postMessage({
          command: 'url',
          href: `http://localhost:${this.port}/?component=${this.document.uri.path}&port=${this.port}`,
        });
      }
      console.log(`request`, req, res);
      res.writeHead(200);
      res.end("ok");
    });
    this.server.listen(this.httpPort, 'localhost', () => {
      console.log(`HSE server opened`);
    });
  }
  closeWebview() {
    this.server.close();
    this.panel.dispose();
  }
  setViewForActiveOgoneDocument(): ReturnType<OgoneWebview['getActiveEditor']> {
    const active = this.getActiveEditor();
    if (active) {
      this.setDocument(active.document);
    }
    return active;
  }
  getActiveEditor(): TextEditor | undefined {
    const { visibleTextEditors } = window;
    const active = visibleTextEditors.find((editor) => editor.document
      && editor.document.uri.fsPath.endsWith('.o3'));
    if (this.document && active && active.document.uri.path === this.document.uri.path) {
      return;
    }
    return active;
  }
  showWelcomeMessage() {
    this.panel.webview.html = this.welcomeMessage;
  }
  getHTML() {
    // And get the special URI to use with the webview
    return `
      <head>
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
      </head>
      <body>
      <div class="wbv_container">
        <div class="wbv_viewer">
          <iframe
            allowtransparency="true"
            id="viewer"></iframe>
        </div>
      </div>
      <script>
        class State {
          static mapState = new Map();
          static viewer = document.getElementById('viewer');
        }
        window.addEventListener('message', (event) => {
          const message = event.data;
          switch(true) {
            case message.command === 'reload'
            && State.viewer
            && State.viewer.contentWindow:
              State.viewer.contentWindow.location.reload();
              break;
            case message.command === 'url':
              State.viewer.contentWindow.location.href = message.href;
              break;
          }
        });
      </script>
    </body>
    `
  }
}