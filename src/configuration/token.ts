import { getPassword, setPassword, deletePassword } from "keytar";
import { IAccount } from "./configuration";

const ServiceName = "Azure Boards VS Code";

export async function getTokenForAccount(
  account: IAccount
): Promise<string | null> {
  return getPassword(ServiceName, account.uri.toLocaleLowerCase());
}

export async function storeTokenForAccount(
  account: IAccount,
  token: string
): Promise<void> {
  await setPassword(ServiceName, account.uri.toLocaleLowerCase(), token);
}

export async function removeTokenForAccount(account: IAccount): Promise<void> {
  await deletePassword(ServiceName, account.uri.toLocaleLowerCase());
}
