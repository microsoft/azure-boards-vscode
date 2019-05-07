import { WorkItemType } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import {
  getCurrentAccount,
  getCurrentProject
} from "../configuration/configuration";
import { getWebApiForAccount } from "../connection";

export class WorkItemTypeProvider {
  private _iconPromise: Promise<WorkItemTypeIcon[]> | [];

  constructor() {
    this._iconPromise = this._getIcons();
  }

  public async getIcons(): Promise<WorkItemTypeIcon[]> {
    if (!this._iconPromise) {
      this._iconPromise = this._getIcons();
    }

    return this._iconPromise;
  }

  private async _getIcons(): Promise<WorkItemTypeIcon[]> {
    const account = getCurrentAccount();
    if (!account) {
      return [];
    }

    const project = await getCurrentProject();
    if (!project) {
      return [];
    }

    const witApi = await (await getWebApiForAccount(
      account
    )).getWorkItemTrackingApi();

    //  Get icons
    const workItemTypes = await witApi.getWorkItemTypes(project.id);
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
