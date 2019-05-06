import * as vscode from "vscode";

export function openUrl(url: string): void {
  if ((<any>vscode.env).openExternal) {
    (<any>vscode.env).openExternal(url);
    return;
  }

  vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
}
