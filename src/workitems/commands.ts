import * as vscode from "vscode";
import { GitExtension } from "../externals/git";
import { WorkItemTreeNodeProvider } from "./workitem.tree";

export function registerCommands() {
  vscode.commands.registerCommand("azure-boards.open-work-item", ars => {
    vscode.commands.executeCommand(
      "vscode.open",
      vscode.Uri.parse(ars.editUrl)
    );
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
