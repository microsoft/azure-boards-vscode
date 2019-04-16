import {
  WorkItemType,
  WorkItem
} from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";

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
  public readonly workItemType: string;
  public readonly workItemId: number;
  public readonly workItemTitle: string;
  public readonly workItemIcon: string;

  public readonly url: string;

  constructor(
    id: number,
    workItems: WorkItem[],
    workItemTypeIcons: WorkItemTypeIcon[]
  ) {
    //get the index of the work item
    let x = workItems.findIndex(x => x.id === id);

    this.workItemType = workItems[x].fields
      ? workItems[x].fields["System.WorkItemType"]
      : "";
    this.workItemId = id ? id : -1;
    this.workItemTitle = workItems[x].fields
      ? workItems[x].fields["System.Title"]
      : "";

    //get index of icon from list of avaible icons for the work item type
    let i = workItemTypeIcons.findIndex(x => x.type === this.workItemType);

    this.workItemIcon = workItemTypeIcons[i].url.toString();
    this.url = workItems[x]._links.html.href;
  }
}
