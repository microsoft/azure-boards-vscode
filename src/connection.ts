import * as DevOpsClient from "azure-devops-node-api";
import { IAccount } from "./configuration/configuration";
import { getTokenForAccount } from "./configuration/token";

export async function getWebApiForAccount(
  account: IAccount
): Promise<DevOpsClient.WebApi> {
  const token = await getTokenForAccount(account);
  if (!token) {
    throw new Error("Cannot get token for account");
  }

  const handler = DevOpsClient.getHandlerFromToken(token);
  return new DevOpsClient.WebApi(account.uri, handler);
}
