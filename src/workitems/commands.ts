import * as vscode from "vscode";
import { GitExtension } from "../externals/git";
import { WorkItemTreeNodeProvider } from "./workitem.tree";

export function registerCommands() {
  vscode.commands.registerCommand("azure-boards.open-work-item", ars => {
    // TODO
    vscode.window.showInformationMessage("Open work item!");
  });

  vscode.commands.registerCommand("azure-boards.refresh-work-items", ars => {
    vscode.window.createTreeView("work-items", {
      treeDataProvider: new WorkItemTreeNodeProvider()
    });

    //vscode.window.showInformationMessage("Refresh work items list");
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
