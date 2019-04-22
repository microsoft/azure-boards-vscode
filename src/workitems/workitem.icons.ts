import { IConnection } from "src/connection/connection";
import { WorkItemType } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";

export class WorkitemTypeIcons {
  constructor(private readonly connection: IConnection) {}

  async getIcons(): Promise<WorkItemTypeIcon[]> {
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
