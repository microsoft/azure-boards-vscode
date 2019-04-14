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

  vscode.commands.registerCommand(
    "azure-boards.mention-work-item",
    workItemId => {
      const gitExtension = vscode.extensions.getExtension<GitExtension>(
        "vscode.git"
      );
      if (gitExtension) {
        const git = gitExtension.exports.getAPI(1);
        const existingCommitMessage: string =
          git.repositories[0].inputBox.value;
        let mentionText: string = ``;
        if (existingCommitMessage) {
          mentionText = `\n` + `Fixes #${workItemId}`;
        } else {
          mentionText = `Fix #${workItemId} `;
        }
        git.repositories[0].inputBox.value += mentionText;
        vscode.commands.executeCommand("workbench.view.scm");
      }
    }
  );
}
