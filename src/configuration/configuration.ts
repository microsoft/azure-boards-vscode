import * as vscode from "vscode";
import { storeTokenForAccount, removeTokenForAccount } from "./token";

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
export async function addAccount(
  account: IAccount,
  token: string
): Promise<void> {
  const config = getConfig();

  let accounts: IAccount[] = [];
  if (config.has("accounts")) {
    accounts = config.get("accounts", []);
  }

  accounts.push(account);

  // Store token
  await storeTokenForAccount(account, token);

  await config.update("accounts", accounts, vscode.ConfigurationTarget.Global);
}

export async function removeAccount(account: IAccount): Promise<void> {
  const config = getConfig();
  if (config.has("accounts")) {
    const accounts: IAccount[] = config.get("accounts", []);
    const idx = accounts.findIndex(
      x => x.uri.toLocaleLowerCase() === account.uri.toLocaleLowerCase()
    );
    if (idx >= 0) {
      accounts.splice(idx, 1);
    }

    await removeTokenForAccount(account);

    await config.update(
      "accounts",
      accounts,
      vscode.ConfigurationTarget.Global
    );
  }
}

export function accountExists(account: IAccount): boolean {
  const config = getConfiguration();

  return config.accounts.some(
    a => a.uri.toLocaleLowerCase() === account.uri.toLocaleLowerCase()
  );
}

/**
 * Set the current account
 */
export async function setCurrentAccount(
  account: IAccount | undefined
): Promise<void> {
  await getConfig().update("current-account", account);
}

/**
 * Get the current account
 */
export function getCurrentAccount(): IAccount | undefined {
  return getConfiguration().currentAccount;
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
