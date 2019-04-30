import * as vscode from "vscode";
import { WorkItemComposite } from "./workitem";
import { MyWorkProvider } from "./workitem.mywork";
import { Commands } from "../commands/commands";
import { getCurrentAccount } from "../configuration/configuration";

export class WorkItemTreeNodeProvider
  implements vscode.TreeDataProvider<TreeNodeParent> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeNodeParent | undefined
  > = new vscode.EventEmitter<TreeNodeParent | undefined>();

  readonly onDidChangeTreeData: vscode.Event<TreeNodeParent | undefined> = this
    ._onDidChangeTreeData.event;

  getChildren(
    element?: TreeNodeParent | undefined
  ): vscode.ProviderResult<TreeNodeParent[]> {
    if (!element) {
      if (!getCurrentAccount()) {
        return [new NoConnectionNode()];
      }

      return [
        new TreeNodeChildWorkItem("Assigned to me", "AssignedToMe"),
        new TreeNodeChildWorkItem("My activity", "MyActivity"),
        new TreeNodeChildWorkItem("Mentioned", "Mentioned"),
        new TreeNodeChildWorkItem("Following", "Following")
      ];
    }

    return element.getWorkItemsForNode();
  }

  getTreeItem(
    element: TreeNodeParent
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }

  refresh(): void {
    // Cause view to refresh
    this._onDidChangeTreeData.fire();
  }
}

export class TreeNodeParent extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.None
  ) {
    super(label, collapsibleState);
    this.iconPath = vscode.ThemeIcon.File;
  }

  async getWorkItemsForNode(): Promise<TreeNodeParent[]> {
    return [];
  }
}

class NoConnectionNode extends TreeNodeParent {
  constructor() {
    super("No connection, please connect to Azure Boards");

    this.contextValue = "no-connection";
  }
}

export class TreeNodeChildWorkItem extends TreeNodeParent {
  constructor(label: string, private readonly type: string) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
  }

  async getWorkItemsForNode(): Promise<TreeNodeParent[]> {
    try {
      //go get the work items from the mywork provider
      const myWorkProvider: MyWorkProvider = new MyWorkProvider();

      //get mashed list of workitems from the myworkprovider
      const workItems = await myWorkProvider.getMyWorkItems(this.type);

      return workItems.map(wi => new WorkItemNode(wi));
    } catch (e) {
      // TODO: Handle error correctly
      console.error(e);
    }

    return [];
  }
}

export class WorkItemNode extends TreeNodeParent {
  public readonly workItemId: number;
  public readonly workItemType: string;
  public readonly iconPath: vscode.Uri;
  public readonly editUrl: string;

  constructor(workItemComposite: WorkItemComposite) {
    super(`${workItemComposite.workItemId} ${workItemComposite.workItemTitle}`);

    this.iconPath = vscode.Uri.parse(workItemComposite.workItemIcon);
    this.workItemId = +workItemComposite.workItemId;
    this.workItemType = workItemComposite.workItemType;
    this.editUrl = workItemComposite.url;
    this.contextValue = "work-item";
    this.tooltip = "Open work item in Azure Boards";

    this.command = {
      command: Commands.WorkItemOpen,
      arguments: [this.editUrl],
      title: "Open work item in Azure Boards"
    };
  }
}
