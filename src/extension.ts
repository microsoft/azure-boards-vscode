import * as vscode from "vscode";
import { WorkItemTreeNodeProvider } from "./workitems/workitem.tree";
import { registerCommands } from "./commands/commands";

export function activate(context: vscode.ExtensionContext) {
  vscode.window.createTreeView("work-items", {
    treeDataProvider: new WorkItemTreeNodeProvider()
  });

  registerCommands(context);
}

export function deactivate() {}
