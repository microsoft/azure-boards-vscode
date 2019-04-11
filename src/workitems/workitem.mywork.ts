import * as DevOpsClient from "azure-devops-node-api";
import { IHttpClientResponse } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";
import { WorkItem } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";

export class MyWorkProvider {
  private _api: DevOpsClient.WebApi;
  private _baseUrl: string;

  constructor(
    private readonly org: string,
    private readonly project: string,
    webApi: DevOpsClient.WebApi
  ) {
    this._api = webApi;
    this._baseUrl =
      "https://dev.azure.com/" +
      this.org +
      "/" +
      this.project +
      "/_apis/work/predefinedQueries/";
  }

  async getMyWorkItems(type: string): Promise<WorkItem[]> {
    const client = this._api.rest.client;
    const url = this._baseUrl + type + "?$top=50&includeCompleted= false";

    const res: IHttpClientResponse = await client.get(url); //needed to call basic client api
    const witApi = await this._api.getWorkItemTrackingApi(); //needed to call wit api

    const body: string = await res.readBody();
    const myWorkResponse: IMyWorkResponse = JSON.parse(body);

    let workItemIds =
      myWorkResponse.results !== null
        ? myWorkResponse.results.map(x => x.id)
        : [];

    const workItems = await witApi.getWorkItems(workItemIds, [
      "System.Id",
      "System.Title",
      "System.WorkItemType"
    ]);

    return workItems;
  }
}

export interface IMyWorkResponse {
  results: IMyWorkResult[];
}

interface IMyWorkResult {
  id: number;
}
