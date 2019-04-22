import { IHttpClientResponse } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";
import {
  WorkItemExpand,
  WorkItem
} from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import { WorkItemComposite } from "./workitem";
import { IConnection } from "src/connection/connection";
import { WorkitemTypeIcons } from "./workitem.icons";

export class MyWorkProvider {
  private _baseUrl: string;

  constructor(private readonly connection: IConnection) {
    this._baseUrl =
      this.connection.getOrgUrl() +
      "/" +
      this.connection.getProject() +
      "/_apis/work/predefinedQueries/";
  }

  async getMyWorkItems(type: string): Promise<WorkItemComposite[]> {
    const client = this.connection.getWebApi().rest.client;
    const url = this._baseUrl + type + "?$top=50&includeCompleted=false";

    const res: IHttpClientResponse = await client.get(url); //needed to call basic client api
    const witApi = await this.connection.getWebApi().getWorkItemTrackingApi(); //needed to call wit api

    const body: string = await res.readBody();
    const myWorkResponse: IMyWorkResponse = JSON.parse(body);

    const workItemTypeIcons = new WorkitemTypeIcons(this.connection);
    const icons = await workItemTypeIcons.getIcons();

    //get id's
    const workItemIds =
      myWorkResponse.results !== null
        ? myWorkResponse.results.map(x => x.id)
        : [];

    //get work items from id's
    const workItems: WorkItem[] = await witApi.getWorkItems(
      workItemIds,
      ["System.Id", "System.Title", "System.WorkItemType"],
      undefined,
      WorkItemExpand.Links
    );

    //loop through work items list and map it to temp map collection
    const workItemsMap: { [workItemId: number]: WorkItem } = {};
    workItems.forEach(wi => (workItemsMap[wi.id ? wi.id : -1] = wi));

    //set the order of workitems to match that of returned id's
    const orderedWorkItems: WorkItem[] = workItemIds.map(
      workItemId => workItemsMap[workItemId]
    );

    //map orderedWorkItems into our composite to include the right icon
    return orderedWorkItems.map(wi => new WorkItemComposite(wi, icons));
  }
}

export interface IMyWorkResponse {
  results: IMyWorkResult[];
}

interface IMyWorkResult {
  id: number;
}
