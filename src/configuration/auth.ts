import { openUrl } from "../util/open";
import * as util from "util";
import * as vscode from "vscode";
import {
  DeviceFlowAuthenticator,
  DeviceFlowDetails,
  IDeviceFlowAuthenticationOptions,
  IDeviceFlowTokenOptions
} from "vsts-device-flow-auth";
import { IAccount } from "./configuration";

const ClientId = "97877f11-0fc6-4aee-b1ff-febb0519dd00";
const RedirectUri = "https://java.visualstudio.com/";

export async function getTokenUsingDeviceFlow(
  account: IAccount
): Promise<string | undefined> {
  const authOptions: IDeviceFlowAuthenticationOptions = {
    clientId: ClientId,
    redirectUri: RedirectUri // account.uri
  };
  const tokenOptions: IDeviceFlowTokenOptions = {
    tokenDescription: `Azure Boards VSCode extension: ${account.uri}`
  };
  const dfa: DeviceFlowAuthenticator = new DeviceFlowAuthenticator(
    account.uri,
    authOptions,
    tokenOptions
  );
  const details: DeviceFlowDetails = await dfa.GetDeviceFlowDetails();

  // To sign in, use a web browser to open the page https://aka.ms/devicelogin and enter the code F3VXCTH2L to authenticate.
  const value = await vscode.window.showInputBox({
    value: details.UserCode,
    prompt: `${Resources.Configuration_DeviceFlowCopyCode} (${
      details.VerificationUrl
    })`,
    placeHolder: undefined,
    password: false
  });
  if (value) {
    // At this point, user has no way to cancel until our timeout expires. Before this point, they could
    // cancel out of the showInputBox. After that, they will need to wait for the automatic cancel to occur.
    openUrl(details.VerificationUrl);

    // FUTURE: Could we display a message that allows the user to cancel the authentication? If they escape from the
    // message or click Close, they wouldn't have that chance any longer. If they leave the message displaying, they
    // have an opportunity to cancel. However, once authenticated, we no longer have an ability to close the message
    // automatically or change the message that's displayed. :-/

    // FUTURE: Add a 'button' on the status bar that can be used to cancel the authentication

    // Wait for up to 5 minutes before we cancel the status polling (Azure's default is 900s/15 minutes)
    const timeout: number = 5 * 60 * 1000;
    /* tslint:disable:align */
    const timer: NodeJS.Timer = setTimeout(() => {
      dfa.Cancel(true); // throw on canceling
    }, timeout);

    // We need to await on withProgress here because we need a token before continuing forward
    const title: string = util.format(
      Resources.Configuration_Authenticating,
      details.UserCode
    );
    const token: string = await vscode.window.withProgress(
      { location: vscode.ProgressLocation.Window, title: title },
      async () => {
        const accessToken: string = await dfa.WaitForPersonalAccessToken();
        // Since we will cancel automatically after timeout, if we _do_ get an accessToken then we need to call clearTimeout
        if (accessToken) {
          clearTimeout(timer);
        }
        return accessToken;
      }
    );

    return token;
  }

  return undefined;
}
