import { IHttpClientResponse } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";
import {
  WorkItem,
  WorkItemExpand
} from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import { IConnection } from "src/connection/connection";

export class MyWorkProvider {
  private _baseUrl: string;

  constructor(private readonly connection: IConnection) {
    this._baseUrl =
      this.connection.getOrgUrl() +
      "/" +
      this.connection.getProject() +
      "/_apis/work/predefinedQueries/";
  }

  async getMyWorkItems(type: string): Promise<WorkItem[]> {
    const client = this.connection.getWebApi().rest.client;
    const url = this._baseUrl + type + "?$top=50&includeCompleted=false";

    const res: IHttpClientResponse = await client.get(url); //needed to call basic client api
    const witApi = await this.connection.getWebApi().getWorkItemTrackingApi(); //needed to call wit api

    const body: string = await res.readBody();
    const myWorkResponse: IMyWorkResponse = JSON.parse(body);

    let workItemIds =
      myWorkResponse.results !== null
        ? myWorkResponse.results.map(x => x.id)
        : [];

    return witApi.getWorkItems(
      workItemIds,
      ["System.Id", "System.Title", "System.WorkItemType"],
      undefined,
      WorkItemExpand.Links
    );
  }
}

export interface IMyWorkResponse {
  results: IMyWorkResult[];
}

interface IMyWorkResult {
  id: number;
}
