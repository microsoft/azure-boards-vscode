"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { registerCommands } from "./workitems/commands";
import { WorkItemTreeNodeProvider } from "./workitems/workitem.tree";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  vscode.window.createTreeView("work-items", {
    treeDataProvider: new WorkItemTreeNodeProvider()
  });

  registerCommands();
}

// this method is called when your extension is deactivated
export function deactivate() {}
