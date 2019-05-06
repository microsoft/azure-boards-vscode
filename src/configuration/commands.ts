import { Commands } from "../commands/commands";
import * as vscode from "vscode";
import { getWebApiForAccount } from "../connection";
import {
  addAccount,
  getConfiguration,
  IAccount,
  IProject,
  setCurrentAccount,
  setCurrentProject
} from "./configuration";
import { storeTokenForAccount } from "./token";
import { getTokenUsingDeviceFlow } from "./auth";

export const enum ConfigurationCommands {
  AddAccount = "azure-boards.add-account",
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
          prompt: "Enter account uri",
          placeHolder: "https://dev.azure.com/<account>"
        });

        if (!accountUri) {
          return;
        }

        // TODO: Check if the account already exists?

        // TODO: Check account uri is well-formed?
        // TODO: Try to be nice and build the account uri?

        const account = { uri: accountUri };

        const token = await getTokenUsingDeviceFlow(account);
        if (!token) {
          return;
        }

        // Store token
        await storeTokenForAccount(account, token);

        // Store this account as known
        await addAccount(account);

        vscode.window.showInformationMessage(
          `${Resources.Configuration_AddedAccount} ${accountUri}`
        );
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ConfigurationCommands.SelectAccount,
      async () => {
        const account = await selectAccount();
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

async function selectAccount(): Promise<IAccount | "add" | undefined> {
  const { accounts } = getConfiguration();
  const AddAccountItem: IAccountQuickPickItem = {
    label: "➕ Add account"
  };

  const selection = await vscode.window.showQuickPick(
    [
      AddAccountItem,
      ...accounts.map(
        account =>
          ({
            label: account.uri,
            account
          } as IAccountQuickPickItem)
      )
    ],
    {
      placeHolder: "Select an account..."
    }
  );
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
  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window,
      title: "Loading projects..."
    },
    async () => {
      const webApi = await getWebApiForAccount(account);
      const coreApi = await webApi.getCoreApi(account.uri);
      const projects = await coreApi.getProjects();

      const selection = await vscode.window.showQuickPick(
        projects.map(
          p =>
            ({
              label: p.name,
              project: p
            } as IProjectQuickPickItem)
        ),
        {
          placeHolder: "Select project..."
        }
      );
      if (!selection) {
        return undefined;
      }

      return selection.project;
    }
  );
}
