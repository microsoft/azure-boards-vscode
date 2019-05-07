import * as vscode from "vscode";
import { GitExtension } from "../../externals/git";

export class PendingWorkItemTreeNodeProvider
  implements vscode.TreeDataProvider<vscode.TreeItem> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    vscode.TreeItem | undefined
  > = new vscode.EventEmitter<vscode.TreeItem | undefined>();

  readonly onDidChangeTreeData: vscode.Event<vscode.TreeItem | undefined> = this
    ._onDidChangeTreeData.event;

  private workItemIds: number[] = [];

  constructor() {
    const gitExtension = vscode.extensions.getExtension<GitExtension>(
      "vscode.git"
    );
    if (gitExtension) {
      const git = gitExtension.exports.getAPI(1);
      setInterval(() => {
        const value =
          (git &&
            git.repositories &&
            git.repositories.length > 0 &&
            git.repositories[0].inputBox.value) ||
          "";

        const matches = value.match(/(#(\d+))/gm);
        const newIds =
          (matches && matches.map(x => parseInt(x.replace(/[^\d]/, "")))) || [];
        if (newIds.some((v, i) => this.workItemIds[i] !== v)) {
          this.workItemIds = newIds;
          this._onDidChangeTreeData.fire();
        }
      }, 2000);
    }
  }

  getChildren(
    element?: vscode.TreeItem | undefined
  ): vscode.ProviderResult<vscode.TreeItem[]> {
    if (!element) {
      return this.workItemIds.map(id => new vscode.TreeItem(`#${id}`));
    }

    return [];
  }

  getTreeItem(
    element: vscode.TreeItem
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
}
