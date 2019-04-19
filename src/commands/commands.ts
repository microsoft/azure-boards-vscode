import * as vscode from "vscode";
import { GitExtension, Remote } from "../externals/git";
import { SettingsPanel } from "../webviews/settings";
import { BaseReactPanel } from "../webviews/webview";

export const enum Commands {
  WorkItemOpen = "azure-boards.open-work-item",
  WorkItemsRefresh = "azure-boards.refresh-work-items",
  WorkItemMention = "azure-boards.mention-work-item",
  SettingsShow = "azure-boards.settings.show"
}

export function registerGlobalCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.WorkItemOpen, args => {
      const editUrl = args.editUrl || args;
      vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(editUrl));
    })
  );

  vscode.commands.registerCommand(Commands.WorkItemMention, args => {
    const workItemId = args.workItemId || args;
    const gitExtension = vscode.extensions.getExtension<GitExtension>(
      "vscode.git"
    );
    mentionWorkItem(gitExtension, workItemId);
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

  function mentionWorkItem(
    gitExtension: vscode.Extension<GitExtension> | undefined,
    workItemId: number
  ) {
    if (gitExtension) {
      const git = gitExtension.exports.getAPI(1);
      if (git.repositories.length) {
        // Determine whether source control is GitHub, if so, prefix mention ID syntax with "AB"
        let mentionSyntaxPrefix: string = ``;
        const activeRemotes: Remote[] = [];
        const originRemotes = git.repositories[0].state.remotes.find(
          remote => remote.name === "origin"
        );
        if (originRemotes) {
          activeRemotes.push(originRemotes);
          const remoteUrl =
            activeRemotes[0].fetchUrl || activeRemotes[0].pushUrl || "";
          mentionSyntaxPrefix = determineMentionSyntaxPrefix(
            remoteUrl,
            mentionSyntaxPrefix
          );
        } else {
          vscode.window.showInformationMessage(
            "No Git source control origin remotes found."
          );
        }

        // Add work item mention to new line if existing commit message, otherwise start with Fix mention
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

        // Navigate to the Source Control view
        vscode.commands.executeCommand("workbench.view.scm");
      } else {
        vscode.window.showInformationMessage(
          "No Git source control repositories found."
        );
      }
    } else {
      vscode.window.showInformationMessage(
        "No Git source control extension found."
      );
    }

    function determineMentionSyntaxPrefix(
      remoteUrl: string,
      mentionSyntaxPrefix: string
    ) {
      // TODO: Determine if GitHub Enterprise (non "github.com" host)
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
      return mentionSyntaxPrefix;
    }
  }
}
