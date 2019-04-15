import * as DevOpsClient from "azure-devops-node-api";

export interface IConnection {
  authToken: string;

  getWebApi(): DevOpsClient.WebApi;

  getProject(): string;

  getOrgUrl(): string;
}

export class AzureBoardsConnection implements IConnection {
  constructor() {}

  dispose() {}

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
}
