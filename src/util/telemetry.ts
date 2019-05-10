import { getCurrentAccount } from "../configuration/configuration";

const _appInsights = require("applicationinsights");
const _instrumentationKey = "4055bdd0-39f8-45ef-a48f-cf563234638d";

export function startTelemetry() {
  _appInsights.setup(_instrumentationKey).start();
}

export function trackTelemetryEvent(name: string) {
  const currentAccount = getCurrentAccount();
  const accountUri = currentAccount ? currentAccount.uri : "";

  let client = _appInsights.defaultClient;
  client.trackEvent({ name: name, properties: { organization: accountUri } });
}

export function trackTelemetryException(error: Error) {
  const currentAccount = getCurrentAccount();
  const accountUri = currentAccount ? currentAccount.uri : "";

  let client = _appInsights.defaultClient;
  client.trackException({
    exception: new Error(error.message),
    properties: { organization: accountUri }
  });
}
