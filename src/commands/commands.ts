import * as vscode from "vscode";
import { GitExtension, Remote } from "../externals/git";
import { WorkItemTreeNodeProvider } from "../workitems/workitem.tree";
import { BaseReactPanel } from "../webviews/webview";
import { SettingsPanel } from "../webviews/settings";

export const enum Commands {
  WorkItemOpen = "azure-boards.open-work-item",

  WorkItemsRefresh = "azure-boards.refresh-work-items",

  WorkItemMention = "azure-boards.mention-work-item",

  ConfigurationShow = "azure-boards.configuration.show"
}

export function registerCommands(context: vscode.ExtensionContext) {
  vscode.commands.registerCommand(Commands.WorkItemOpen, args => {
    vscode.commands.executeCommand(
      "vscode.open",
      vscode.Uri.parse(args.editUrl)
    );
  });

  vscode.commands.registerCommand(Commands.WorkItemsRefresh, () => {
    // TODO: We shouldn't recreate the view here
    vscode.window.createTreeView("work-items", {
      treeDataProvider: new WorkItemTreeNodeProvider()
    });
  });

  vscode.commands.registerCommand(Commands.WorkItemMention, ars => {
    const workItemId = ars.workItemId | ars;
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
  });

  //
  // Configuration
  //
  vscode.commands.registerCommand(Commands.ConfigurationShow, () => {
    BaseReactPanel.createOrShow<SettingsPanel>(
      SettingsPanel,
      context.extensionPath
    );
  });
}
