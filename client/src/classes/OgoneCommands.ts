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
  commands,
  window,
  Uri,
  Range,
  SnippetString,
} from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { walkSync } from 'nodejs-fs-utils';
import OgoneDocument from './OgoneDocument';
import OgoneWebview from './OgoneWebview';


interface ComponentInformations {
  type: string;
  name: string;
  pathToComponent: string;
}
export default class OgoneCommands extends OgoneDocument {
  folders: string[] = [];
  constructor(private webview: OgoneWebview) {
    super();
    // get all directories
    // avoid git directory
    // node_modules directory
    // and .ogone directory
    walkSync(workspace.workspaceFolders[0].uri.path, (err, folderPath, stats, next, cache) => {
      if (stats.isDirectory() && !folderPath.match(/\/(\.git|node_modules|\.ogone)/)) {
        this.folders.push(folderPath);
      }
      next();
    });
    /**
     * add commands
     */
    commands.registerCommand('otone.startHSESession', async () => {
      this.openWebviewSaveRequired();
    });
    commands.registerCommand('otone.navigation.previous', async () => {
      this.getPreviousFile();
    });
    commands.registerCommand('otone.startHSESessionExperimental', async () => {
      this.openWebviewExperimentalOnType();
    });
    commands.registerCommand('otone.createApplication', async () => {
      await this.createApplication();
    });
    commands.registerCommand('otone.createComponent', async () => {
      const infos = await this.getComponentInformations();
      if (infos) {
        this.createComponent(infos);
      }
    });
    commands.registerCommand('otone.action.create', async () => {
      this.appendComponentToDocument();
    });
  }
  openWebviewSaveRequired(): void {
    if (this.webview) {
      this.webview.openWebview(true)
    }
  }
  openWebviewExperimentalOnType(): void {
    if (this.webview) {
      this.webview.openWebview(false)
    }
  }
  async createApplication(): Promise<void> {
    const res = await window.showInputBox({
      /**
       * The value to prefill in the input box.
       */
      value: './',

      /**
       * The text to display underneath the input box.
       */
      prompt: 'create a new Ogone application with a template',

      /**
       * An optional string to show as place holder in the input box to guide the user what to type.
       */
      placeHolder: 'path/to/new/application/',

      /**
       * Set to `true` to keep the input box open when focus moves to another part of the editor or to another window.
       */
      ignoreFocusOut: false,

      /**
       * An optional function that will be called to validate input and to give a hint
       * to the user.
       *
       * @param value The current value of the input box.
       * @return A human readable string which is presented as diagnostic message.
       * Return `undefined`, `null`, or the empty string when 'value' is valid.
       */
      /*
      validateInput(value: string): string | undefined | null | Thenable<string | undefined | null> {
        return true;
      }
      */
    });
  }
  async createComponent(infos: ComponentInformations) {
    const { type, pathToComponent, name } = infos;
    const filePath = path.join(
      pathToComponent,
      `${name}.o3`
    );
    let templateNode = `
/**
 * @name ${name}
 * @type ${type}
 * @date ${new Date().toUTCString()}
 */
<template>
  <style>
      .container {}
  </style>
  <!-- nodeType 1, 3, 8 supported -->
  <div class="container">
  </div>
</template>`;
    let protoBody = '';
    switch (type) {
      case 'app':
        break;
      case 'component':
        protoBody = `
declare:
  // component's data
default:
  // component's initialization
  break;
        `;
        break;
      case 'store':
        templateNode = '';
        protoBody = `
declare:
  // store's data
        `;
        break;
      case 'async':
        protoBody = `
declare:
  // component's data
default:
  Async.resolve();
  break;
        `;
        break;
      case 'router':
        protoBody = `
def:
  # YAML
  # provide the routes objects here
  routes: []
default:
  // component's initialization
  break;
        `;
        break;
    }
    let protoNode = `
<proto type="${type || 'component'}">
${protoBody.trim()}
</proto>`;
    let file = `
${templateNode.trim()}
${protoNode.trim()}
    `;
    fs.writeFileSync(filePath, file);
    window.showInformationMessage(`Component created.`);
    // now open the new component
    const openPath = Uri.parse(`file://${filePath}`);
    workspace.openTextDocument(openPath)
      .then((doc) => {
        window.showTextDocument(doc)
      })
  }
  async getComponentInformations(): Promise<ComponentInformations> {
    let type, pathToComponent, name = await window.showInputBox({
      /**
       * The value to prefill in the input box.
       */
      value: 'untitled',

      /**
       * The text to display underneath the input box.
       */
      prompt: 'Component\'s name',

      /**
       * An optional string to show as place holder in the input box to guide the user what to type.
       */
      placeHolder: 'Untitled',

      /**
       * Set to `true` to keep the input box open when focus moves to another part of the editor or to another window.
       */
      ignoreFocusOut: false,
    });
    const reg = /(?<componentName>.+?)\|(?<componentType>(app|component|store|async|router))\|(?<componentPath>.+?)/i;
    let match;
    if ((match = name.match(reg)) && match.groups) {
      const {
        componentName,
        componentType,
        componentPath,
      } = match.groups;
      name = componentName;
        type = componentType;
        pathToComponent = componentPath;
    } else {
      type = await window.showQuickPick([
        'component',
        'store',
        'router',
        'async',
        'app',
      ], {
        /**
         * An optional flag to include the description when filtering the picks.
         */
        matchOnDescription: true,

        /**
         * An optional flag to include the detail when filtering the picks.
         */
        matchOnDetail: true,

        /**
         * An optional string to show as place holder in the input box to guide the user what to pick on.
         */
        placeHolder: 'choose the type of your component',

        /**
         * Set to `true` to keep the picker open when focus moves to another part of the editor or to another window.
         */
        ignoreFocusOut: false,

        /**
         * An optional flag to make the picker accept multiple selections, if true the result is an array of picks.
         */
        canPickMany: false,
      });
      pathToComponent = await window.showQuickPick(this.folders,
      {
        /**
         * An optional flag to include the description when filtering the picks.
         */
        matchOnDescription: true,

        /**
         * An optional flag to include the detail when filtering the picks.
         */
        matchOnDetail: true,

        /**
         * An optional string to show as place holder in the input box to guide the user what to pick on.
         */
        placeHolder: 'choose a folder for your component',

        /**
         * Set to `true` to keep the picker open when focus moves to another part of the editor or to another window.
         */
        ignoreFocusOut: false,

        /**
         * An optional flag to make the picker accept multiple selections, if true the result is an array of picks.
         */
        canPickMany: false,
      });
    }
    return {
      type,
      name,
      pathToComponent,
    };
  }
  getPreviousFile() {
    window.activeTextEditor.hide();
  }
  appendComponentToDocument() {
    const active = window.activeTextEditor;
    if (!active) return;
    const document = active.document;
    const text = document.getText();
    active.insertSnippet(
      new SnippetString(`
component <$\{1:Name}$6>
  <style>
    div {
      color: red;
    }
  </style>
  <div --if(this.show)>
    $\{ this.message }
  </div>
  <proto type=$\{3|app,component,async,router,store,gl|}>
    declare:
      public message: string = '$\{4|test,Hello Ogone,Hello World|}';
      public show: boolean = $\{5|true,false|};
    default: break;
  </proto>
</$\{1:Name}>
`),
      new Range(
        document.positionAt(text.length),
        document.positionAt(text.length),
      )
    )
  }
}