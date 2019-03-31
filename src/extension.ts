"use strict";
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import { WorkItemTreeNodeProvider } from "./workitems/workitem";
import { GitExtension } from "./externals/git";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  vscode.window.createTreeView("work-items", {
    treeDataProvider: new WorkItemTreeNodeProvider()
  });

  vscode.commands.registerCommand("azure-boards.prefill", workItemId => {
    const gitExtension = vscode.extensions.getExtension<GitExtension>(
      "vscode.git"
    );
    if (gitExtension) {
      const git = gitExtension.exports.getAPI(1);
      git.repositories[0].inputBox.value = `Fix #${workItemId}`;
    }
  });
}

// this method is called when your extension is deactivated
export function deactivate() {}
