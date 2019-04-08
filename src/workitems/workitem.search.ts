import * as DevOpsClient from "azure-devops-node-api";
import { IHttpClientResponse } from "azure-devops-node-api/interfaces/common/VsoBaseInterfaces";

export class SearchProvider {
  private _searchUrl: string = "https://almsearch.dev.azure.com/";
  private _api: DevOpsClient.WebApi;

  constructor(private readonly org: string, webApi: DevOpsClient.WebApi) {
    this._searchUrl +=
      this.org +
      "/_apis/search/workitemsearchresults?api-version=5.0-preview.1";
    this._api = webApi;
  }

  async searchWorkItems(data: object): Promise<WorkItem[]> {
    const client = this._api.rest.client;

    let res: IHttpClientResponse = await client.post(
      this._searchUrl,
      JSON.stringify(data),
      {
        Accept: "application/json",
        "Content-Type": "application/json"
      }
    );

    let body: string = await res.readBody();
    let jsonObject: SearchRoot = JSON.parse(body);

    const workitems: WorkItem[] = jsonObject.results.map(x => new WorkItem(x));

    return workitems;
  }
}

export class SearchRoot {
  public count: number = 0;
  public results: SearchResult[] = [];
}

export class SearchResult {
  public fields: { [refName:string]: number | string | boolean | Date };
}

export class WorkItem {
  public readonly id: string;
  public readonly assignedTo: string;
  public readonly state: string;
  public readonly title: string;
  public readonly workItemType: string;

  constructor(results: SearchResult) {
    this.id = results.fields ? results.fields["system.id"] : "-1";
    this.assignedTo = results.fields
      ? results.fields["system.assignedto"]
      : null;
    this.state = results.fields ? results.fields["system.state"] : null;
    this.title = results.fields ? results.fields["system.title"] : null;
    this.workItemType = results.fields
      ? results.fields["system.workitemtype"]
      : null;
  }
}
