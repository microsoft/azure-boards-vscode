import { getPassword, setPassword } from "keytar";
import { IAccount } from "./configuration";

const ServiceName = "Azure Boards VS Code";

export async function getTokenForAccount(
  account: IAccount
): Promise<string | null> {
  return getPassword(ServiceName, account.uri);
}

export async function storeTokenForAccount(
  account: IAccount,
  token: string
): Promise<void> {
  await setPassword(ServiceName, account.uri, token);
}
