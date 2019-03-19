import * as DevOpsClient from "azure-devops-node-api";
import { WorkItem } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import * as vscode from "vscode";

export class WorkItemTreeNodeProvider implements vscode.TreeDataProvider<TreeNode> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeNode | undefined> = new vscode.EventEmitter<TreeNode | undefined>();
    readonly onDidChangeTreeData: vscode.Event<TreeNode | undefined> = this._onDidChangeTreeData.event;

    getChildren(element?: TreeNode | undefined): vscode.ProviderResult<TreeNode[]> {
        if (!element) {
            return [
                new WiqlNode(
                    "Assigned to me",
                    "SELECT [System.Id], [System.Title] FROM [WorkItems] WHERE [System.AssignedTo] = @me"),
                new WiqlNode(
                    "Followed by me",
                    "SELECT [System.Id], [System.Title] FROM [WorkItems] WHERE [System.Id] IN (@follows)")
            ];
        }

        return element.getChildren();
    }

    getTreeItem(element: TreeNode): vscode.TreeItem | Thenable<vscode.TreeItem> {
        return element;
    }
}

export class TreeNode extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None) {
        super(label, collapsibleState);
    }

    async getChildren(): Promise<TreeNode[]> {
        return [];
    }
}

export class WiqlNode extends TreeNode {
    constructor(label: string, private readonly wiql: string) {
        super(label, vscode.TreeItemCollapsibleState.Collapsed);
    }

    async getChildren(): Promise<TreeNode[]> {
        try {
            const token = getToken();
            const handler = DevOpsClient.getHandlerFromToken(token);

            const orgUrl = "https://cschleiden.visualstudio.com";
            const api = new DevOpsClient.WebApi(orgUrl, handler);

            const witApi = await api.getWorkItemTrackingApi();
            const result = await witApi.queryByWiql(
                {
                    query: this.wiql
                },
                {
                    project: "AgileTestGit",
                    team: "",
                    projectId: "",
                    teamId: ""
                });

            const workItemIds = result.workItems.map(x => x.id);
            const workItems = await witApi.getWorkItems(workItemIds, ["System.Id", "System.Title", "System.WorkItemType"]);

            return workItems.map(wi => new WorkItemNode(wi));
        } catch (e) {
            console.error(e);
        }

        return [];
    }
}

export class WorkItemNode extends TreeNode {
    public readonly workItemId: number;

    constructor(workItemData: WorkItem) {
        super(`${workItemData.fields["System.Id"]} ${workItemData.fields["System.Title"]}`);

        this.workItemId = +workItemData.fields["System.Id"];
    }
}

function getToken(): string {
    return "<add PAT here>";
}