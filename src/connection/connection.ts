import * as DevOpsClient from "azure-devops-node-api";
import {
  WorkItemTypeProvider
} from "../workitems/workitem.icons";

export interface IConnection {
  authToken: string;
  workItemProvider: WorkItemTypeProvider | null;

  getWebApi(): DevOpsClient.WebApi;

  getProject(): string;

  getOrgUrl(): string;
}

export class AzureBoardsConnection implements IConnection {
  private _workItemProvider: WorkItemTypeProvider | undefined;

  constructor() { }

  dispose() { }

  get isAuthenticated(): boolean {
    return false;
  }

  get authToken(): string {
    return "6krvvgluyu5kdydywm5ywvgh7sdt3wmo624cpcod7igks3cl7noa";
  }

  getWebApi(): DevOpsClient.WebApi {
    const orgUrl = this.getOrgUrl();

    // Build the devops web api to be used in other calls
    const handler = DevOpsClient.getHandlerFromToken(this.authToken);
    return new DevOpsClient.WebApi(orgUrl, handler);
  }

  getProject(): string {
    return "VSCodeTest";
  }

  getOrgUrl(): string {
    return "https://dev.azure.com/basicprocess";
  }

  get workItemProvider(): WorkItemTypeProvider {
    if (this._workItemProvider === undefined) {
      this._workItemProvider = new WorkItemTypeProvider(this);
    }

    return this._workItemProvider;
  }
}
