import * as DevOpsClient from "azure-devops-node-api";
import * as vscode from "vscode";
import { WorkItemTypeIcon, WorkItemComposite } from "./workitem";

export class WorkItemTreeNodeProvider
  implements vscode.TreeDataProvider<TreeNode> {
  private _onDidChangeTreeData: vscode.EventEmitter<
    TreeNode | undefined
  > = new vscode.EventEmitter<TreeNode | undefined>();
  readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this
    ._onDidChangeTreeData.event;

  getChildren(
    element?: TreeNode | undefined
  ): vscode.ProviderResult<TreeNode[]> {
    if (!element) {
      return [
        new WorkItemListNode(
          "Assigned to me",
          "SELECT [System.Id], [System.Title] FROM [WorkItems] WHERE [System.AssignedTo] = @me"
        ),
        new WorkItemListNode(
          "Followed by me",
          "SELECT [System.Id], [System.Title] FROM [WorkItems] WHERE [System.Id] IN (@follows)"
        )
      ];
    }

    return element.getWorkItemsForNode();
  }

  getTreeItem(element: TreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
    return element;
  }
}

export class TreeNode extends vscode.TreeItem {
  constructor(
    public readonly label: string,
    collapsibleState: vscode.TreeItemCollapsibleState = vscode
      .TreeItemCollapsibleState.None
  ) {
    super(label, collapsibleState);

    this.iconPath = vscode.ThemeIcon.File;
  }

  async getWorkItemsForNode(): Promise<TreeNode[]> {
    return [];
  }
}

export class WorkItemListNode extends TreeNode {
  constructor(label: string, private readonly wiql: string) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
  }

  async getWorkItemsForNode(): Promise<TreeNode[]> {
    try {
      const token = getToken();
      const handler = DevOpsClient.getHandlerFromToken(token);

      const orgUrl = "https://danhellem.visualstudio.com";
      const api = new DevOpsClient.WebApi(orgUrl, handler);

      const workItemTypeIcons = await this.getWorkItemTypeIcons(api);
      const workItemIds = await this.getListOfWorkItems(api, this.wiql);

      const witApi = await api.getWorkItemTrackingApi();
      const workItems = await witApi.getWorkItems(workItemIds, [
        "System.Id",
        "System.Title",
        "System.WorkItemType"
      ]);
      const workItemList = workItems.map(
        wi => new WorkItemComposite(wi, workItemTypeIcons)
      );

      return workItemList.map(wi => new WorkItemNode(wi));
    } catch (e) {
      console.error(e);
    }

    return [];
  }

  async getListOfWorkItems(
    api: DevOpsClient.WebApi,
    wiql: string
  ): Promise<number[]> {
    var witApi = await api.getWorkItemTrackingApi();
    var result = await witApi.queryByWiql(
      {
        query: wiql
      },
      {
        project: "My Work",
        team: "",
        projectId: "",
        teamId: ""
      }
    );

    const workItemIds: number[] =
      (result.workItems &&
        (result.workItems
          .map(x => x.id)
          .filter(x => x !== undefined) as number[])) ||
      [];

    return workItemIds;
  }

  async getWorkItemTypeIcons(
    api: DevOpsClient.WebApi
  ): Promise<(WorkItemTypeIcon)[]> {
    const witApi = await api.getWorkItemTrackingApi();

    const workItemTypes = await witApi.getWorkItemTypes("My Work");
    const icons =
      workItemTypes !== null
        ? workItemTypes.map(x => new WorkItemTypeIcon(x))
        : [];

    return icons;
  }
}

export class WorkItemNode extends TreeNode {
  public readonly workItemId: number;
  public readonly workItemType: string;
  public readonly iconPath: vscode.Uri;

  constructor(workItemComposite: WorkItemComposite) {
    super(`${workItemComposite.workItemId} ${workItemComposite.workItemTitle}`);

    this.iconPath = vscode.Uri.parse(workItemComposite.workItemUrl);
    this.workItemId = +workItemComposite.workItemId;
    this.workItemType = workItemComposite.workItemType;

    this.command = {
      command: "azure-boards.prefill",
      arguments: [this.workItemId],
      title: "Prefill commit message"
    };
  }
}

function getToken(): string {
  return "6wmjj7ypmnbntu3vizs62shohlrkyzzvu3k234tx54neafhprrpq";
}
