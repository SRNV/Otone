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
  Disposable,
} from 'vscode';
import OgoneDocument from './OgoneDocument';
import Workers from '../ogone/workers';
import * as path from 'path';
import { Webview } from '../enums/templateWebview';
import * as Websocket from 'ws';
import * as http from 'http';
import * as fs from 'fs';
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
  heartBeatInterval?: ReturnType<typeof setTimeout>;
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
  disposableOnSelect: Disposable;
  disposableOnChangeVisibleTextEditor: Disposable;
  constructor(opts: OgoneWebviewConstructorOptions,
    public disposableOnSave?: Disposable,
    public disposableOnType?: Disposable) {
    super();
    const { context, files } = opts;
    const updateWebview = (document) => {
      if (document.uri.path.endsWith('.o3') && document.uri.path !== this.document.uri.path) {
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
    this.disposableOnChangeVisibleTextEditor = window.onDidChangeVisibleTextEditors(updateWebview);
    this.disposableOnSelect = window.onDidChangeTextEditorSelection((ev) => {
      const { document } = ev.textEditor;
      if (!document.uri.path.endsWith('.o3')) {
        this.showWelcomeMessage();
        return;
      }
    });
  }
  get httpPort(): number {
    return this.port + 1;
  }
  get welcomeMessage() {
    return /**html*/`
    <p align="center">
    <style>
    img {
      max-width: 350px;
      max-height: 350px;
    }
    </style>
      <img
        width="350px"
        height="350px"
        src="vscode-resource:${this.ogoneLogoSpecialUri}" />
    </p>
    ${Webview.WELCOME_MESSAGE}
    `;
  }
  setDocument(document: TextDocument) {
    this.document = document;
    this.updateWebview();
  }
  async openWebview(
    /**
     * should dispose from the type reaction
     */
    shouldDisposeOnTypeEdition?: boolean) {
    if (shouldDisposeOnTypeEdition && this.disposableOnType) {
      this.disposableOnType.dispose();
    }
    try {
      const filePort = fs.readFileSync(path.join(workspace.workspaceFolders[0].uri.path, './.ogone/channel/port'), { encoding: 'utf8' });
      this.port = parseFloat(filePort);
    } catch (err) {
      this.closeWebview();
    }
    const errorDevServerNotRunning = 'Otone - the ogone dev server isn\'t running, please run your application before trying to start a session.';
    try {
      const res = await axios.get(`http://localhost:${this.port}/`);
      if (res.status !== 200) {
        window.showErrorMessage(errorDevServerNotRunning);
        return;
      }
    } catch (err) {
      window.showErrorMessage(errorDevServerNotRunning);
      return;
    }
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
    this.panel.iconPath = this.iconPath;
    await this.startHeartBeat();
    this.watchApplication();
    this.showLoadingMessage();
  }
  watchApplication() {
    fs.watch(path.join(workspace.workspaceFolders[0].uri.path, './.ogone/channel/application'), { encoding: 'utf-8' }, () => {
      this.render();
    });
  }
  updateWebview() {
    if (!this.panel) {
      return;
    }
    if (this.document) {
      this.showLoadingMessage();
      const json = JSON.stringify(this.document.uri);
      fs.writeFileSync(path.join(workspace.workspaceFolders[0].uri.path, './.ogone/channel/component.json'), json);
    }
  }
  closeWebview() {
    window.showInformationMessage('otone - closing webview.');
    clearTimeout(this.heartBeatInterval);
    if (this.panel) this.panel.dispose();
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
  showLoadingMessage() {
    this.panel.webview.html = `
<style>
  @keyframes spin {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
  img {
    max-width: 350px;
    max-height: 350px;
    animation: 1s linear 0s infinite alternate spin;
  }
  .container {
    margin: auto;
    width: 400px;
    height: 400px;
  }
</style>
<div class="container">
  <p align="center">
      <img
        width="350px"
        height="350px"
        src="vscode-resource:${this.ogoneLogoSpecialUri}" />
  </p>
  <p align="center">loading...</p>
  </div>`;
  }
  async startHeartBeat() {
    try {
      const res = await axios.get(`http://localhost:${this.port}/`);
      if (res.status > 400) {
        this.closeWebview();
      } else {
        const active = this.setViewForActiveOgoneDocument();
        if (active) {
          this.render();
        }
        this.heartBeatInterval = setTimeout(async () => {
          this.startHeartBeat();
        }, 500);
      }
    } catch (err) {
      this.closeWebview();
    }
  }
  render() {
    if (this.panel) {
      this.panel.webview.html = this.getHTML();
    }
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
            src="http://localhost:${this.port}/?component=${this.document.uri.path}&port=${this.port}"
            allowtransparency="true"
            id="viewer"></iframe>
        </div>
      </div>
    </body>
    `
  }
}