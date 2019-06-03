// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import * as vscode from "vscode";
import { storeTokenForOrganization, removeTokenForOrganization } from "./token";

export interface IOrganization {
  uri: string;
}

export interface IConfiguration {
  currentOrganization: IOrganization | undefined;
  currentProject: IProject | undefined;

  organizations: IOrganization[];
}

export interface IProject {
  id: string;
  name: string;
}

const ConfigKey = "azure-boards";

function getConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(ConfigKey);
}

export function getConfiguration(): IConfiguration {
  const config = getConfig();

  return {
    organizations: config.get("organizations", []),
    currentOrganization: config.get("current-organization", undefined),
    currentProject: config.get("current-project", undefined)
  };
}

/**
 * Add a new organization
 * @param organization
 */
export async function addOrganization(
  organization: IOrganization,
  token: string
): Promise<void> {
  const config = getConfig();

  let organizations: IOrganization[] = [];
  if (config.has("organizations")) {
    organizations = config.get("organizations", []);
  }

  organizations.push(organization);

  // Store token
  await storeTokenForOrganization(organization, token);

  await config.update(
    "organizations",
    organizations,
    vscode.ConfigurationTarget.Global
  );
}

export async function removeOrganization(
  organization: IOrganization
): Promise<void> {
  const config = getConfig();
  if (config.has("organizations")) {
    const organizations: IOrganization[] = config.get("organizations", []);
    const idx = organizations.findIndex(
      x => x.uri.toLocaleLowerCase() === organization.uri.toLocaleLowerCase()
    );
    if (idx >= 0) {
      organizations.splice(idx, 1);
    }

    await removeTokenForOrganization(organization);

    await config.update(
      "organizations",
      organizations,
      vscode.ConfigurationTarget.Global
    );
  }
}

export function organizationExists(organization: IOrganization): boolean {
  const config = getConfiguration();

  return config.organizations.some(
    a => a.uri.toLocaleLowerCase() === organization.uri.toLocaleLowerCase()
  );
}

/**
 * Set the current organization
 */
export async function setCurrentOrganization(
  organization: IOrganization | undefined
): Promise<void> {
  await getConfig().update("current-organization", organization);
}

/**
 * Get the current organization
 */
export function getCurrentOrganization(): IOrganization | undefined {
  return getConfiguration().currentOrganization;
}

/**
 * Set the current project
 */
export async function setCurrentProject(
  project: IProject | undefined
): Promise<void> {
  await getConfig().update("current-project", project);
}

/**
 * Get the current project
 */
export function getCurrentProject(): IProject | undefined {
  return getConfiguration().currentProject;
}

export function compareOrganizations(
  orgA: IOrganization,
  orgB: IOrganization
): number {
  return orgA.uri.localeCompare(orgB.uri);
}

export function compareProjects(projA: IProject, projB: IProject): number {
  return projA.name.localeCompare(projB.name);
}
