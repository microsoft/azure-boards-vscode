// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { getPassword, setPassword, deletePassword } from "keytar";
import { IOrganization } from "./configuration";

const ServiceName = "Azure Boards VS Code";

export async function getTokenForOrganization(
  organization: IOrganization
): Promise<string | null> {
  return getPassword(ServiceName, organization.uri.toLocaleLowerCase());
}

export async function storeTokenForOrganization(
  organization: IOrganization,
  token: string
): Promise<void> {
  await setPassword(ServiceName, organization.uri.toLocaleLowerCase(), token);
}

export async function removeTokenForOrganization(
  organization: IOrganization
): Promise<void> {
  await deletePassword(ServiceName, organization.uri.toLocaleLowerCase());
}
