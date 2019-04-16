import { IHttpClientResponse } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";
import { WorkItemExpand } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import { WorkItemTypeIcon, WorkItemComposite } from "./workitem";
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

  async getMyWorkItems(type: string): Promise<WorkItemComposite[]> {
    const client = this.connection.getWebApi().rest.client;
    const url = this._baseUrl + type + "?$top=50&includeCompleted=false";
    const project = this.connection.getProject();

    const res: IHttpClientResponse = await client.get(url); //needed to call basic client api
    const witApi = await this.connection.getWebApi().getWorkItemTrackingApi(); //needed to call wit api

    const body: string = await res.readBody();
    const myWorkResponse: IMyWorkResponse = JSON.parse(body);

    //get icons
    //todo: stop loading this up on each node, just load once and cache it
    const workItemTypes = await witApi.getWorkItemTypes(project);
    const icons =
      workItemTypes !== null
        ? workItemTypes.map(x => new WorkItemTypeIcon(x))
        : [];

    //get id's
    let workItemIds =
      myWorkResponse.results !== null
        ? myWorkResponse.results.map(x => x.id)
        : [];

    //get work items from id's
    let workItems = await witApi.getWorkItems(
      workItemIds,
      ["System.Id", "System.Title", "System.WorkItemType"],
      undefined,
      WorkItemExpand.Links
    );

    //mash all together
    return workItemIds.map(wi => new WorkItemComposite(wi, workItems, icons));
  }
}

export interface IMyWorkResponse {
  results: IMyWorkResult[];
}

interface IMyWorkResult {
  id: number;
}
