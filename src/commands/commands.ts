import * as vscode from "vscode";
import { GitExtension } from "../externals/git";
import { WorkItemTreeNodeProvider } from "../workitems/workitem.tree";
import { BaseReactPanel } from "../webviews/webview";
import { SettingsPanel } from "../webviews/settings";

export const enum Commands {
  WorkItemOpen = "azure-boards.open-work-item",

  WorkItemsRefresh = "azure-boards.refresh-work-items",

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

  // TODO: Categorize this better
  vscode.commands.registerCommand("azure-boards.prefill", workItemId => {
    const gitExtension = vscode.extensions.getExtension<GitExtension>(
      "vscode.git"
    );
    if (gitExtension) {
      const git = gitExtension.exports.getAPI(1);
      git.repositories[0].inputBox.value = `Fix #${workItemId}`;
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
