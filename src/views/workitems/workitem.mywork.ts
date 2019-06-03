// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

import { IHttpClientResponse } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";
import {
  WorkItem,
  WorkItemExpand
} from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import {
  getCurrentOrganization,
  getCurrentProject
} from "../../configuration/configuration";
import { getWebApiForOrganization } from "../../connection";
import { WorkItemComposite } from "./workitem";
import { WorkItemTypeProvider } from "../../workitems/workitem.icons";
import { trackTelemetryEvent } from "../../util/telemetry";

export class MyWorkProvider {
  private workItemTypeProvider = new WorkItemTypeProvider();

  async getMyWorkItems(type: string): Promise<WorkItemComposite[]> {
    const currentOrganization = getCurrentOrganization();
    if (!currentOrganization) {
      return [];
    }

    const currentProject = getCurrentProject();
    if (!currentProject) {
      return [];
    }

    const webApi = await getWebApiForOrganization(currentOrganization);
    const client = webApi.rest.client;

    const baseUrl =
      currentOrganization.uri +
      "/" +
      currentProject.id +
      "/_apis/work/predefinedQueries/";

    const url = baseUrl + type + "?$top=50&includeCompleted=false";

    const res: IHttpClientResponse = await client.get(url); //needed to call basic client api
    const witApi = await webApi.getWorkItemTrackingApi(); //needed to call wit api

    const body: string = await res.readBody();
    const myWorkResponse: IMyWorkResponse = JSON.parse(body);

    // get work item icons from work item provider
    const icons = this.workItemTypeProvider
      ? await this.workItemTypeProvider.getIcons()
      : null;

    // get id's
    const workItemIds =
      myWorkResponse.results !== null
        ? myWorkResponse.results.map(x => x.id)
        : [];

    // get work items from id's
    const workItems: WorkItem[] =
      (await witApi.getWorkItems(
        workItemIds,
        ["System.Id", "System.Title", "System.WorkItemType"],
        undefined,
        WorkItemExpand.Links
      )) || [];

    // loop through work items list and map it to temp map collection
    const workItemsMap: { [workItemId: number]: WorkItem } = {};
    workItems.forEach(wi => (workItemsMap[wi.id ? wi.id : -1] = wi));

    // set the order of workitems to match that of returned id's
    const orderedWorkItems: WorkItem[] = workItemIds.map(
      workItemId => workItemsMap[workItemId]
    );

    // track telemetry event
    trackTelemetryEvent(type);

    // map orderedWorkItems into our composite to include the right icon
    return orderedWorkItems.map(wi => new WorkItemComposite(wi, icons));
  }
}

export interface IMyWorkResponse {
  results: IMyWorkResult[];
}

interface IMyWorkResult {
  id: number;
}
