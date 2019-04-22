import { WorkItem } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import { WorkItemTypeIcon } from "./workitem.icons";

export class WorkItemComposite {
  public readonly workItemType: string;
  public readonly workItemId: number;
  public readonly workItemTitle: string;
  public readonly workItemIcon: string;

  public readonly url: string;

  constructor(workItem: WorkItem, workItemTypeIcons: WorkItemTypeIcon[]) {
    this.workItemType = workItem.fields
      ? workItem.fields["System.WorkItemType"]
      : "";
    this.workItemId = workItem.fields ? workItem.fields["System.Id"] : -1;
    this.workItemTitle = workItem.fields ? workItem.fields["System.Title"] : "";

    //get index of icon from list of avaible icons for the work item type
    let i = workItemTypeIcons.findIndex(x => x.type === this.workItemType);

    this.workItemIcon = workItemTypeIcons[i].url.toString();
    this.url = workItem._links.html.href;
  }
}
