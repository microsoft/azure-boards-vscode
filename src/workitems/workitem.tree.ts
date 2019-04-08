import * as DevOpsClient from "azure-devops-node-api";
import * as vscode from "vscode";
import { WorkItemTypeIcon, WorkItemComposite } from "./workitem";
import { SearchProvider, WorkItem } from "./workitem.search";

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
    const projectName: string = getProject();

    if (!element) {
      return [
        //new TreeNodeChildWorkItem(
        //  "My activity",
        //  "SELECT [System.Id], [System.Title] FROM [WorkItems] WHERE [System.AssignedTo] = @me"
        //),
        new TreeNodeChildWorkItem("Assigned to me", {
          searchText: "a: @Me",
          $skip: 0,
          $top: 100,
          filters: {
            "System.TeamProject": ["" + projectName + ""]
          },
          $orderBy: [
            {
              field: "system.changeddate",
              sortOrder: "DESC"
            }
          ],
          includeFacets: false
        })
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
  constructor(label: string, private readonly data: Object) {
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

      //go get the work items using the search provider
      const search: SearchProvider = new SearchProvider(org, api);
      const workItemSearchResults: WorkItem[] = await search.searchWorkItems(
        this.data
      );

      //get the list of work item types for the project
      const workItemTypeIcons = await this.getWorkItemTypeIcons(api, project);

      //map up work items from search results and the icons into the
      //workitemcomposite object
      const workItemList = (workItemSearchResults || []).map(
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

  constructor(workItemComposite: WorkItemComposite) {
    super(`${workItemComposite.workItemId} ${workItemComposite.workItemTitle}`);

    this.iconPath = vscode.Uri.parse(workItemComposite.workItemUrl);
    this.workItemId = +workItemComposite.workItemId;
    this.workItemType = workItemComposite.workItemType;

    this.contextValue = "work-item";

    this.command = {
      command: "azure-boards.prefill",
      arguments: [this.workItemId],
      title: "Prefill commit message"
    };
  }
}

function getToken(): string {
  return "3tyncx5qaest2tfczwqbwijmdlgrmrdsdiswrlhafh2yhggsbssq";
}

function getProject(): string {
  return "VSCodeTest";
}

function getOrg(): string {
  return "basicprocess";
}
