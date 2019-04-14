import * as vscode from "vscode";
import { GitExtension, Remote } from "../externals/git";
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
        if (git.repositories.length) {
          // determine whether source control is github.com, if so prefix mention ID syntax with "AB". To-Do: determine if GitHub Enterprise (non "github.com" host)
          let mentionSyntaxPrefix: string = ``;
          const activeRemotes: Remote[] = [];
          const originRemotes = git.repositories[0].state.remotes.find(
            remote => remote.name === "origin"
          );
          if (originRemotes) {
            activeRemotes.push(originRemotes);
            const remoteUrl =
              activeRemotes[0].fetchUrl || activeRemotes[0].pushUrl || "";
            const remoteUri = vscode.Uri.parse(remoteUrl);
            const authority = remoteUri.authority;
            const matches = /^(?:.*:?@)?([^:]*)(?::.*)?$/.exec(authority);
            if (
              matches &&
              matches.length >= 2 &&
              matches[1].toLowerCase() === "github.com"
            ) {
              mentionSyntaxPrefix = `AB`;
            }
          }
          // add work item mention to new line if existing commit message, otherwise start with Fix mention
          const existingCommitMessage: string =
            git.repositories[0].inputBox.value;
          let mentionText: string = ``;
          if (existingCommitMessage) {
            mentionText =
              `\n` + `Fixes ` + mentionSyntaxPrefix + `#${workItemId}`;
          } else {
            mentionText = `Fix ` + mentionSyntaxPrefix + `#${workItemId} `;
          }
          git.repositories[0].inputBox.value += mentionText;
          // navigate to the Source Control view
          vscode.commands.executeCommand("workbench.view.scm");
        }
      }
    }
  );
}
