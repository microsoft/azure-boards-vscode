import * as DevOpsClient from "azure-devops-node-api";
import * as vscode from "vscode";
import { WorkItemTypeIcon, WorkItemComposite } from "./workitem";
import { MyWorkProvider } from "./workitem.mywork";

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

export class TreeNodeChildWorkItem extends TreeNodeParent {
  constructor(label: string, private readonly type: string) {
    super(label, vscode.TreeItemCollapsibleState.Collapsed);
  }

  async getWorkItemsForNode(): Promise<TreeNodeParent[]> {
    try {
      const token = getToken();
      const org = getOrg();
      const orgUrl = "https://dev.azure.com/" + org;
      const project = getProject();

      //build the devops web api to be used in other calls
      const handler = DevOpsClient.getHandlerFromToken(token);
      const api = new DevOpsClient.WebApi(orgUrl, handler);

      //go get the work items from the mywork provider
      const myWorkProvider: MyWorkProvider = new MyWorkProvider(
        org,
        project,
        api
      );

      const workitems = await myWorkProvider.getMyWorkItems(this.type);

      //get the list of work item types for the project
      const workItemTypeIcons = await this.getWorkItemTypeIcons(api, project);

      //map up work items from search results and the icons into the
      //workitemcomposite object
      const workItemList = workitems.map(
        wi => new WorkItemComposite(wi, workItemTypeIcons)
      );

      return workItemList.map(wi => new WorkItemNode(wi));
    } catch (e) {
      console.error(e);
    }

    return [];
  }

  async getWorkItemTypeIcons(
    api: DevOpsClient.WebApi,
    project: string
  ): Promise<(WorkItemTypeIcon)[]> {
    const witApi = await api.getWorkItemTrackingApi();
    const workItemTypes = await witApi.getWorkItemTypes(project);

    const icons =
      workItemTypes !== null
        ? workItemTypes.map(x => new WorkItemTypeIcon(x))
        : [];

    return icons;
  }
}

export class WorkItemNode extends TreeNodeParent {
  public readonly workItemId: number;
  public readonly workItemType: string;
  public readonly iconPath: vscode.Uri;
  public readonly editUrl: string;

  constructor(workItemComposite: WorkItemComposite) {
    super(`${workItemComposite.workItemId} ${workItemComposite.workItemTitle}`);

    //build url that can be used later to browse directly to the work item
    const url: string =
      "https://dev.azure.com/" +
      getOrg() +
      "/" +
      getProject() +
      "/_workitems/edit/";

    this.iconPath = vscode.Uri.parse(workItemComposite.workItemIcon);
    this.workItemId = +workItemComposite.workItemId;
    this.workItemType = workItemComposite.workItemType;
    this.editUrl = url + this.workItemId.toString(); //append work item id to url

    this.contextValue = "work-item";

    this.command = {
      command: "azure-boards.mention-work-item",
      arguments: [this.workItemId],
      title: "Mention work item in commit message"
    };
  }
}

function getToken(): string {
  return "6krvvgluyu5kdydywm5ywvgh7sdt3wmo624cpcod7igks3cl7noa";
}

function getProject(): string {
  return "VSCodeTest";
}

function getOrg(): string {
  return "basicprocess";
}
