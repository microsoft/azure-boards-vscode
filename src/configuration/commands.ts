import { setPassword } from "keytar";
import * as vscode from "vscode";
import { addAccount } from "./configuration";

export function registerConfigurationCommands(
  context: vscode.ExtensionContext
): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("azure-boards.add-account", async () => {
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
      addAccount({ uri: accountUri });
    })
  );
}
