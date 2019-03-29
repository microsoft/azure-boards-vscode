import * as DevOpsClient from "azure-devops-node-api";
import { WorkItem, WorkItemType } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import * as vscode from "vscode";

export class WorkItemTreeNodeProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this._onDidChangeTreeData.event;

    getChildren(element?: TreeNode | undefined): vscode.ProviderResult<TreeNode[]> {
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
    constructor(public readonly label: string, collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None) {
        super(label, collapsibleState);
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
            const workItems = await witApi.getWorkItems(workItemIds, ["System.Id", "System.Title", "System.WorkItemType"]);
            const workItemList = workItems.map(wi => new WorkItemComposite(wi, workItemTypeIcons));

            return workItemList.map(wi => new WorkItemNode(wi));

        } catch (e) {
            console.error(e);
        }

        return [];
    }

    async getListOfWorkItems(api: DevOpsClient.WebApi, wiql: string): Promise<(number | undefined)[]> {
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

        let workItemIds = result.workItems != null ? result.workItems.map(x => x.id) : [];

        return workItemIds;
    }

    async getWorkItemTypeIcons(api: DevOpsClient.WebApi): Promise<(WorkItemTypeIcon)[]> {
        const witApi = await api.getWorkItemTrackingApi();

        const workItemTypes = await witApi.getWorkItemTypes("My Work");
        const icons = workItemTypes != null ? workItemTypes.map(x => new WorkItemTypeIcon(x)) : [];

        return icons;
    };
}

export class WorkItemNode extends TreeNode {
    public readonly workItemId: number;
    public readonly workItemIcon: string;
    public readonly workItemType: string;

    constructor(workItemComposite: WorkItemComposite) {
        super(`${workItemComposite.workItemId} ${workItemComposite.workItemTitle}`);

        this.workItemId = +workItemComposite.workItemId;
        this.workItemType = workItemComposite.workItemType;
        this.workItemIcon = workItemComposite.workItemIcon;
    }
}

export class WorkItemTypeIcon {
    public readonly type: string = "";
    public readonly icon: string = "";
    public readonly url: string = "";

    constructor(workItemType: WorkItemType) {
        this.type = workItemType.name ? workItemType.name : "";
        this.icon = (workItemType.icon && workItemType.icon.id) ? workItemType.icon.id : "";
        this.url = (workItemType.icon && workItemType.icon.url) ? workItemType.icon.url : "";
    }
}

export class WorkItemComposite {
    public readonly workItemType: string = "";
    public readonly workItemId: number = -1;
    public readonly workItemTitle: string = "";
    public readonly workItemIcon: string = "";

    constructor(workItem: WorkItem, workItemTypeIcons: WorkItemTypeIcon[]) {
        this.workItemType = workItem.fields ? workItem.fields["System.WorkItemType"] : "";
        this.workItemId = workItem.fields ? workItem.fields["System.Id"] : -1;
        this.workItemTitle = workItem.fields ? workItem.fields["System.Title"] : "";

        //get index of icon from list of avaible icons for the work item type
        //seems like there should be a better way of doing this?
        let i = workItemTypeIcons.findIndex(x => x.type === this.workItemType);

        this.workItemIcon = workItemTypeIcons[i].icon.toString();
    }

}

function getToken(): string {
    return "";
}


