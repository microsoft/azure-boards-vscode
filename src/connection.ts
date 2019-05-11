import * as DevOpsClient from "azure-devops-node-api";
import { IOrganization } from "./configuration/configuration";
import { getTokenForOrganization } from "./configuration/token";

export async function getWebApiForOrganization(
  organization: IOrganization
): Promise<DevOpsClient.WebApi> {
  const token = await getTokenForOrganization(organization);
  if (!token) {
    throw new Error("Cannot get token for organization");
  }

  const handler = DevOpsClient.getHandlerFromToken(token);
  return new DevOpsClient.WebApi(organization.uri, handler);
}
