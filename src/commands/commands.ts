import * as vscode from "vscode";
import { GitExtension } from "../externals/git";
import { SettingsPanel } from "../webviews/settings";
import { BaseReactPanel } from "../webviews/webview";

export const enum Commands {
  WorkItemOpen = "azure-boards.open-work-item",

  WorkItemsRefresh = "azure-boards.refresh-work-items",

  SettingsShow = "azure-boards.settings.show"
}

export function registerGlobalCommands(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.WorkItemOpen, args => {
      vscode.commands.executeCommand(
        "vscode.open",
        vscode.Uri.parse(args.editUrl)
      );
    })
  );

  // TODO: Categorize this better
  context.subscriptions.push(
    vscode.commands.registerCommand("azure-boards.prefill", workItemId => {
      const gitExtension = vscode.extensions.getExtension<GitExtension>(
        "vscode.git"
      );
      if (gitExtension) {
        const git = gitExtension.exports.getAPI(1);
        git.repositories[0].inputBox.value = `Fix #${workItemId}`;
      }
    })
  );

  //
  // Configuration
  //
  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.SettingsShow, () => {
      BaseReactPanel.createOrShow<SettingsPanel>(
        SettingsPanel,
        context.extensionPath
      );
    })
  );
}
