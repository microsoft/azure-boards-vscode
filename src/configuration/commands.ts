import { setPassword } from "keytar";
import * as vscode from "vscode";
import {
  addAccount,
  IAccount,
  getConfiguration,
  setCurrentAccount,
  IProject,
  setCurrentProject
} from "./configuration";
import { getWebApiForAccount } from "../connection";

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
          prompt: "Enter account uri"
        });

        if (!accountUri) {
          return;
        }

        // TODO: Start device flow, for now just ask for token
        const token = await vscode.window.showInputBox({
          value: "",
          prompt: `Provide token for ${accountUri}`,
          placeHolder: "",
          password: true
        });

        if (!token) {
          return;
        }

        //   // Try to find existing token
        //   const currentToken = await getPassword(
        //     "Azure Boards VS Code",
        //     accountUri
        //   );

        // Store token
        await setPassword("Azure Boards VS Code", accountUri, token);

        // Store this account as known
        await addAccount({ uri: accountUri });
      }
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand(
      ConfigurationCommands.SelectAccount,
      async () => {
        const account = await selectAccount();
        if (account) {
          await setCurrentAccount(account);

          const project = await selectProject(account);
          if (project) {
            await setCurrentProject(project);
          }

          // TODO: CS: Show confirmation?
        }
      }
    )
  );
}

async function selectAccount(): Promise<IAccount | undefined> {
  const { accounts } = getConfiguration();

  const selection = await vscode.window.showQuickPick(
    accounts.map(a => a.uri),
    {
      placeHolder: "Select an account..."
    }
  );
  if (selection) {
    return accounts.filter(x => x.uri === selection)[0];
  }

  return undefined;
}

interface IProjectQuickPickItem extends vscode.QuickPickItem {
  project: IProject;
}

async function selectProject(account: IAccount): Promise<IProject | undefined> {
  return vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Window
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
