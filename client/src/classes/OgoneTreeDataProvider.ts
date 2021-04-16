import {
  DocumentLink,
  ProviderResult,
  TextDocument,
  TreeDataProvider,
  TreeItem,
  TreeItemCollapsibleState,
  window,
  Event,
  EventEmitter,
  languages,
  workspace,
  Position,
  DocumentHighlight,
  ColorInformation,
  Color,
  ColorPresentation,
  Range,
} from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import OgoneDocument from './OgoneDocument';

export default class OgoneTreeDataProvider extends OgoneDocument implements TreeDataProvider<ComponentItem>{
  constructor(private workspaceRoot: string) {
    super();
  }
  getTreeItem(element: ComponentItem): TreeItem {
    return element;
  }
  getChildren(element?: ComponentItem): Thenable<ComponentItem[]> {
    if (!this.workspaceRoot) {
      window.showInformationMessage('No dependency in empty workspace');
      return Promise.resolve([]);
    }
    if (!element) {
      const components = [];
      workspace.findFiles('**/*.o3').then((files) => {
        files.forEach((file) => {
          const componentName = file.path;
          components.push(
            new ComponentItem(
              componentName,
              'a description',
              // 0 none - 1 collapsed - 2 expanded
              1,
            )
          )
        })
      });
      return Promise.resolve(components);
    }
    return Promise.resolve([
      new ComponentItem('test', 'test', 2),
    ]);
  }
  private pathExists(p: string): boolean {
    try {
      fs.accessSync(p);
    } catch (err) {
      return false;
    }
    return true;
  }
  // private _onDidChangeTreeData: EventEmitter<ComponentItem | undefined | null | void> = new EventEmitter<ComponentItem | undefined | null | void>();
  // readonly onDidChangeTreeData: Event<ComponentItem | undefined | null | void> = this._onDidChangeTreeData.event;
  /*
  refresh(): void {
    this._onDidChangeTreeData.fire();
  }
  */
}
class ComponentItem extends TreeItem {
  constructor(
    public readonly label: string,
    private version: string,
    public readonly collapsibleState: TreeItemCollapsibleState
  ) {
    super(label, collapsibleState);
    this.tooltip = `${this.label}-${this.version}`;
    this.description = this.version;
  }

  iconPath = {
    light: path.join(__filename, '..', '..', 'resources', 'light', 'dependency.svg'),
    dark: path.join(__filename, '..', '..', 'resources', 'dark', 'dependency.svg')
  };
  contextValue = 'dependency';
}

