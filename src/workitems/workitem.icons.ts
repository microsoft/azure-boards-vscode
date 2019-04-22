import { IConnection } from "src/connection/connection";
import { WorkItemType } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";

export class WorkItemTypeProvider {
  private _iconPromise: Promise<WorkItemTypeIcon[]> | [];

  constructor(private readonly connection: IConnection) {
    this._iconPromise = this._getIcons();
  }

  public async getIcons(): Promise<WorkItemTypeIcon[]> {
    if (!this._iconPromise) {
      this._iconPromise = this._getIcons();
    }

    return this._iconPromise;
  }

  private async _getIcons(): Promise<WorkItemTypeIcon[]> {
    const project = this.connection.getProject();
    const witApi = await this.connection.getWebApi().getWorkItemTrackingApi(); //needed to call wit api

    //get icons
    const workItemTypes = await witApi.getWorkItemTypes(project);
    const icons =
      workItemTypes !== null
        ? workItemTypes.map(x => new WorkItemTypeIcon(x))
        : [];

    return icons;
  }
}

export class WorkItemTypeIcon {
  public readonly type: string = "";
  public readonly icon: string = "";
  public readonly url: string = "";

  constructor(workItemType: WorkItemType) {
    this.type = workItemType.name ? workItemType.name : "";
    this.icon =
      workItemType.icon && workItemType.icon.id ? workItemType.icon.id : "";
    this.url =
      workItemType.icon && workItemType.icon.url ? workItemType.icon.url : "";
  }
}
