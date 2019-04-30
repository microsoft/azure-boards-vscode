import * as vscode from "vscode";

export interface IAccount {
  uri: string;
}

export interface IConfiguration {
  currentAccount: IAccount | undefined;
  currentProject: IProject | undefined;

  accounts: IAccount[];
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
    accounts: config.get("accounts", []),
    currentAccount: config.get("current-account", undefined),
    currentProject: config.get("current-project", undefined)
  };
}

/**
 * Add a new account
 * @param account
 */
export async function addAccount(account: IAccount): Promise<void> {
  const config = getConfig();

  let accounts: IAccount[] = [];
  if (config.has("accounts")) {
    accounts = config.get("accounts", []);
  }

  accounts.push(account);

  await config.update("accounts", accounts, vscode.ConfigurationTarget.Global);
}

/**
 * Set the current account
 */
export async function setCurrentAccount(account: IAccount): Promise<void> {
  await getConfig().update("current-account", account);
}

/**
 * Get the current account
 */
export function getCurrentAccount(): IAccount | undefined {
  return getConfiguration().currentAccount;
}

/**
 * Set the current account
 */
export async function setCurrentProject(project: IProject): Promise<void> {
  await getConfig().update("current-project", project);
}

/**
 * Get the current account
 */
export function getCurrentProject(): IProject | undefined {
  return getConfiguration().currentProject;
}
