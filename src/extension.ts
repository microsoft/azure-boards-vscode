import * as vscode from "vscode";
import { Commands, registerGlobalCommands } from "./commands/commands";
import { registerConfigurationCommands } from "./configuration/commands";
import { WorkItemTreeNodeProvider } from "./workitems/workitem.tree";

export function activate(context: vscode.ExtensionContext) {
  registerTreeView(context);

  registerGlobalCommands(context);

  registerConfigurationCommands(context);
}

/**
 * Register work items tree view
 */
export function registerTreeView(context: vscode.ExtensionContext): void {
  const treeDataProvider = new WorkItemTreeNodeProvider();

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
