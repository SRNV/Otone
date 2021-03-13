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
  Range,
} from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import OgoneDocument from './OgoneDocument';
import OgoneWebview from './OgoneWebview';


export default class OgoneCommands extends OgoneDocument {
  constructor(private webview: OgoneWebview) {
    super();
    /**
     * add commands
     */
    commands.registerCommand('otone.startHSESession', async () => {
      this.openWebview();
    });
    commands.registerCommand('otone.createApplication', async () => {
      await this.createApplication();
    });
    commands.registerCommand('otone.createComponent', async () => {
      await this.createComponent();
    });
  }
  openWebview(): void {
    if (this.webview) {
      this.webview.openWebview()
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
  async createComponent(): Promise<void> {
    const type = await window.showQuickPick([
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
      placeHolder: 'component',

      /**
       * Set to `true` to keep the picker open when focus moves to another part of the editor or to another window.
       */
      ignoreFocusOut: false,

      /**
       * An optional flag to make the picker accept multiple selections, if true the result is an array of picks.
       */
      canPickMany: false,
    });
    const path = await window.showInputBox({
      /**
       * The value to prefill in the input box.
       */
      value: 'path/to/component',

      /**
       * The text to display underneath the input box.
       */
      prompt: 'Path to the new Component',

      /**
       * An optional string to show as place holder in the input box to guide the user what to type.
       */
      placeHolder: 'component | app | async | router | store',

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
    window.showInformationMessage(`${type} ${path}`);
  }
}