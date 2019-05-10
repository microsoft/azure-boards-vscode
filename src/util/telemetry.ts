import { getCurrentAccount } from "../configuration/configuration";

export abstract class Telemetry {
  private static _appInsights = require("applicationinsights");
  private static _instrumentationKey = "4055bdd0-39f8-45ef-a48f-cf563234638d";

  public static init() {
    Telemetry._appInsights.setup(Telemetry._instrumentationKey).start();
  }

  public static trackEvent(name: string) {
    const currentAccount = getCurrentAccount();
    const accountUri = currentAccount ? currentAccount.uri : "";

    let client = Telemetry._appInsights.defaultClient;
    client.trackEvent({ name: name, properties: { organization: accountUri } });
  }

  public static trackException(error: string) {
    const currentAccount = getCurrentAccount();
    const accountUri = currentAccount ? currentAccount.uri : "";

    let client = Telemetry._appInsights.defaultClient;
    client.trackException({
      exception: new Error(error),
      properties: { organization: accountUri }
    });
  }
}
