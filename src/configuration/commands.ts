import { format } from "util";
import * as vscode from "vscode";
import { Commands } from "../commands/commands";
import { getWebApiForAccount } from "../connection";
import { getTokenUsingDeviceFlow } from "./auth";
import {
  accountExists,
  addAccount,
  getConfiguration,
  getCurrentAccount,
  IAccount,
  IProject,
  removeAccount,
  setCurrentAccount,
  setCurrentProject
} from "./configuration";
import { isValidAzureBoardsUrl } from "./url";

export const enum ConfigurationCommands {
  AddAccount = "azure-boards.add-account",
  RemoveAccount = "azure-boards.remove-account",
  SelectAccount = "azure-boards.select-account"
}

export function registerConfigurationCommands(
  context: vscode.ExtensionContext
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      ConfigurationCommands.AddAccount,
      async () => {
        const accountUri = await vscode.window.showInputBox({
          prompt: Resources.Configuration_AccountUriPrompt,
          placeHolder: "https://dev.azure.com/<account>"
        });

        if (!accountUri) {
          return;
        }

        if (!isValidAzureBoardsUrl(accountUri)) {
          vscode.window.showErrorMessage(
            format(Resources.Configuration_InvalidUri, accountUri)
          );

          return;
        }

        const account = { uri: accountUri };

        if (accountExists(account)) {
          vscode.window.showErrorMessage(
            format(Resources.Configuration_AccountExists, accountUri)
          );

          return;
        }

        const token = await getTokenUsingDeviceFlow(account);
        if (!token) {
          return;
        }

        // Store this account and token as known
        await addAccount(account, token);

        vscode.window.showInformationMessage(
          `${Resources.Configuration_AddedAccount} ${accountUri}`
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ConfigurationCommands.RemoveAccount,
      async () => {
        const account = await selectAccount();
        if (!account || account === "add") {
          return;
        }

        await removeAccount(account);

        // If the removed account was the current one, remove that as well
        const currentAccount = getCurrentAccount();
        if (
          currentAccount &&
          account.uri.toLocaleLowerCase() ===
            currentAccount.uri.toLocaleLowerCase()
        ) {
          setCurrentAccount(undefined);
          setCurrentProject(undefined);
        }

        vscode.window.showInformationMessage(
          Resources.Configuration_RemovedAccount
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ConfigurationCommands.SelectAccount,
      async () => {
        const account = await selectAccount(true);
        if (!account) {
          return;
        }

        if (account === "add") {
          // Add new account, then restart selection
          await vscode.commands.executeCommand(
            ConfigurationCommands.AddAccount
          );
          await vscode.commands.executeCommand(
            ConfigurationCommands.SelectAccount
          );
        } else {
          await setCurrentAccount(account);

          const project = await selectProject(account);
          if (project) {
            await setCurrentProject(project);
          }

          // Refresh view now that we have a connection
          await vscode.commands.executeCommand(Commands.Refresh);
        }
      }
    )
  );
}

interface IAccountQuickPickItem extends vscode.QuickPickItem {
  account?: IAccount;
}

async function selectAccount(
  allowAdd?: boolean
): Promise<IAccount | "add" | undefined> {
  const { accounts } = getConfiguration();
  const AddAccountItem: IAccountQuickPickItem = {
    label: "➕ Add account"
  };

  const accountOptions = accounts.map(
    account =>
      ({
        label: account.uri,
        account
      } as IAccountQuickPickItem)
  );
  if (allowAdd) {
    accountOptions.unshift(AddAccountItem);
  }

  const selection = await vscode.window.showQuickPick(accountOptions, {
    placeHolder: Resources.Configuration_SelectAccount
  });
  if (selection) {
    if (selection === AddAccountItem) {
      return "add";
    }

    return selection.account;
  }

  return undefined;
}

interface IProjectQuickPickItem extends vscode.QuickPickItem {
  project: IProject;
}

async function selectProject(account: IAccount): Promise<IProject | undefined> {
  const projects = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      title: Resources.Configuration_LoadingProjects
    },
    async () => {
      const webApi = await getWebApiForAccount(account);
      const coreApi = await webApi.getCoreApi(account.uri);
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
    projects.map(
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
