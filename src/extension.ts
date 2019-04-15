import * as vscode from "vscode";
import { Commands, registerGlobalCommands } from "./commands/commands";
import { AzureBoardsConnection, IConnection } from "./connection/connection";
import { WorkItemTreeNodeProvider } from "./workitems/workitem.tree";

export function activate(context: vscode.ExtensionContext) {
  // Create Azure Boards connection object
  const connection = new AzureBoardsConnection();
  context.subscriptions.push(connection);

  registerTreeView(context, connection);

  registerGlobalCommands(context);
}

/**
 * Register work items tree view
 */
export function registerTreeView(
  context: vscode.ExtensionContext,
  connection: IConnection
): void {
  const treeDataProvider = new WorkItemTreeNodeProvider(connection);

  context.subscriptions.push(
    vscode.window.createTreeView("work-items", {
      treeDataProvider
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.WorkItemsRefresh, () => {
      treeDataProvider.refresh();
    })
  );
}
