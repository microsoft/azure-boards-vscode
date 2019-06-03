// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { format } from "util";
import * as vscode from "vscode";
import { Commands } from "../commands/commands";
import { getWebApiForOrganization } from "../connection";
import { getTokenUsingDeviceFlow } from "./auth";
import {
  addOrganization,
  getConfiguration,
  getCurrentOrganization,
  IOrganization,
  IProject,
  organizationExists,
  removeOrganization,
  setCurrentOrganization,
  setCurrentProject,
  compareOrganizations,
  compareProjects
} from "./configuration";
import { isValidAzureBoardsUrl } from "./url";

export const enum ConfigurationCommands {
  AddOrganization = "azure-boards.add-organization",
  RemoveOrganization = "azure-boards.remove-organization",
  SelectOrganization = "azure-boards.select-organization"
}

export function registerConfigurationCommands(
  context: vscode.ExtensionContext
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      ConfigurationCommands.AddOrganization,
      async () => {
        const organizationUri = await vscode.window.showInputBox({
          prompt: Resources.Configuration_OrganizationUriPrompt,
          placeHolder: "https://dev.azure.com/<organization>"
        });

        if (!organizationUri) {
          return;
        }

        if (!isValidAzureBoardsUrl(organizationUri)) {
          vscode.window.showErrorMessage(
            format(Resources.Configuration_InvalidUri, organizationUri)
          );

          return;
        }

        const organization = { uri: organizationUri };

        if (organizationExists(organization)) {
          vscode.window.showErrorMessage(
            format(Resources.Configuration_OrganizationExists, organizationUri)
          );

          return;
        }

        const token = await getTokenUsingDeviceFlow(organization);
        if (!token) {
          return;
        }

        // Store this organization and token as known
        await addOrganization(organization, token);

        vscode.window.showInformationMessage(
          `${Resources.Configuration_AddedOrganization} ${organizationUri}`
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ConfigurationCommands.RemoveOrganization,
      async () => {
        const organization = await selectOrganization();
        if (!organization || organization === "add") {
          return;
        }

        await removeOrganization(organization);

        // If the removed organization was the current one, remove that as well
        const currentOrganization = getCurrentOrganization();
        if (
          currentOrganization &&
          organization.uri.toLocaleLowerCase() ===
            currentOrganization.uri.toLocaleLowerCase()
        ) {
          setCurrentOrganization(undefined);
          setCurrentProject(undefined);
        }

        vscode.window.showInformationMessage(
          Resources.Configuration_RemovedOrganization
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ConfigurationCommands.SelectOrganization,
      async () => {
        const organization = await selectOrganization(true);
        if (!organization) {
          return;
        }

        if (organization === "add") {
          // Add new organization, then restart selection
          await vscode.commands.executeCommand(
            ConfigurationCommands.AddOrganization
          );
          await vscode.commands.executeCommand(
            ConfigurationCommands.SelectOrganization
          );
        } else {
          const project = await selectProject(organization);
          if (project) {
            await setCurrentOrganization(organization);
            await setCurrentProject(project);
          }

          // Refresh view now that we have a connection
          await vscode.commands.executeCommand(Commands.Refresh);
        }
      }
    )
  );
}

interface IOrganizationQuickPickItem extends vscode.QuickPickItem {
  organization?: IOrganization;
}

async function selectOrganization(
  allowAdd?: boolean
): Promise<IOrganization | "add" | undefined> {
  const { organizations } = getConfiguration();
  const AddOrganizationItem: IOrganizationQuickPickItem = {
    label: "➕ Add organization"
  };

  const organizationOptions = organizations.sort(compareOrganizations).map(
    organization =>
      ({
        label: organization.uri,
        organization
      } as IOrganizationQuickPickItem)
  );
  if (allowAdd) {
    organizationOptions.unshift(AddOrganizationItem);
  }

  const selection = await vscode.window.showQuickPick(organizationOptions, {
    placeHolder: Resources.Configuration_SelectOrganization
  });
  if (selection) {
    if (selection === AddOrganizationItem) {
      return "add";
    }

    return selection.organization;
  }

  return undefined;
}

interface IProjectQuickPickItem extends vscode.QuickPickItem {
  project: IProject;
}

async function selectProject(
  organization: IOrganization
): Promise<IProject | undefined> {
  const projects = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      title: Resources.Configuration_LoadingProjects
    },
    async () => {
      const webApi = await getWebApiForOrganization(organization);
      const coreApi = await webApi.getCoreApi(organization.uri);
      const projects = await coreApi.getProjects();
      return projects.map(
        p =>
          ({
            id: p.id,
            name: p.name
          } as IProject)
      );
    }
  );

  const selection = await vscode.window.showQuickPick(
    projects.sort(compareProjects).map(
      p =>
        ({
          label: p.name,
          project: p
        } as IProjectQuickPickItem)
    ),
    {
      placeHolder: Resources.Configuration_SelectProject
    }
  );
  if (!selection) {
    return undefined;
  }

  return selection.project;
}
