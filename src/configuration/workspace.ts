import * as vscode from "vscode";

export interface IWorkspaceConfiguration {
  accountUri?: string;

  project?: IProject;
}

export interface IProject {
  id?: string;
  name?: string;
}

export function getConfiguration(): IWorkspaceConfiguration | undefined {
  const config = vscode.workspace.getConfiguration("azure-boards");

  return {
    accountUri: config.get("account"),
    project: {
      id: config.get("projectId"),
      name: config.get("projectName")
    }
  };
}
