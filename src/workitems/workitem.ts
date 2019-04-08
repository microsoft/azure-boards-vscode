import { WorkItemType } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import { WorkItem } from "./workitem.search";

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

export class WorkItemComposite {
  public readonly workItemType: string = "";
  public readonly workItemId: string = "";
  public readonly workItemTitle: string = "";
  public readonly workItemUrl: string = "";

  constructor(workItem: WorkItem, workItemTypeIcons: WorkItemTypeIcon[]) {
    this.workItemType = workItem.workItemType ? workItem.workItemType : "";
    this.workItemId = workItem.id ? workItem.id : "-1";
    this.workItemTitle = workItem.title ? workItem.title : "";

    //get index of icon from list of avaible icons for the work item type
    //seems like there should be a better way of doing this?
    let i = workItemTypeIcons.findIndex(x => x.type === this.workItemType);

    this.workItemUrl = workItemTypeIcons[i].url.toString();
  }
}
