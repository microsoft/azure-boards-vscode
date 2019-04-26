import * as vscode from "vscode";

export interface IAccount {
  uri: string;
}

export interface IConfiguration {
  preferredAccount: IAccount | undefined;

  accounts: IAccount[];
}

export interface IProject {
  id?: string;
  name?: string;
}

const ConfigKey = "azure-boards";

function getConfig(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration(ConfigKey);
}

export function getConfiguration(): IConfiguration | undefined {
  const config = getConfig();

  return {
    accounts: config.get("accounts", []),
    preferredAccount: config.get("preferred-account", undefined)
  };
}

export function addAccount(account: IAccount): void {
  const config = getConfig();

  let accounts: IAccount[] = [];
  if (config.has("accounts")) {
    accounts = config.get("accounts", []);
  }

  accounts.push(account);

  config.update("accounts", accounts);
}

export function setPreferredAccount(account: IAccount): void {
  getConfig().update("preferred-acount", account);
}
