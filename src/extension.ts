// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import * as vscode from "vscode";
import { Commands, registerGlobalCommands } from "./commands/commands";
import { registerConfigurationCommands } from "./configuration/commands";
import { WorkItemTreeNodeProvider } from "./views/workitems/workitem.tree";
import { startTelemetry, trackTelemetryEvent } from "./util/telemetry";

export function activate(context: vscode.ExtensionContext) {
  startTelemetry();
  trackTelemetryEvent("Loading Azure Boards Extension");

  registerTreeView(context);

  registerGlobalCommands(context);

  registerConfigurationCommands(context);
}

/**
 * Register work items tree view
 */
export function registerTreeView(context: vscode.ExtensionContext): void {
  const treeDataProvider = new WorkItemTreeNodeProvider();

  context.subscriptions.push(
    vscode.window.createTreeView("work-items", {
      treeDataProvider
    })
  );

  // context.subscriptions.push(
  //   vscode.window.createTreeView("pending-work-items", {
  //     treeDataProvider: new PendingWorkItemTreeNodeProvider()
  //   })
  // );

  context.subscriptions.push(
    vscode.commands.registerCommand(Commands.Refresh, () => {
      treeDataProvider.refresh();
    })
  );
}
