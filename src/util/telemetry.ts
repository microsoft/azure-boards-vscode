// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { getCurrentOrganization } from "../configuration/configuration";

const _appInsights = require("applicationinsights");
const _instrumentationKey = "4055bdd0-39f8-45ef-a48f-cf563234638d";

export function startTelemetry() {
  _appInsights.setup(_instrumentationKey).start();
}

export function trackTelemetryEvent(name: string) {
  const currentOrganization = getCurrentOrganization();
  const organizationUri = currentOrganization ? currentOrganization.uri : "";

  let client = _appInsights.defaultClient;
  client.trackEvent({
    name: name,
    properties: { organization: organizationUri }
  });
}

export function trackTelemetryException(error: Error) {
  const currentOrganization = getCurrentOrganization();
  const organizationUri = currentOrganization ? currentOrganization.uri : "";

  let client = _appInsights.defaultClient;
  client.trackException({
    exception: new Error(error.message),
    properties: { organization: organizationUri }
  });
}
