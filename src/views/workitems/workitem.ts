import { WorkItem } from "azure-devops-node-api/interfaces/WorkItemTrackingInterfaces";
import { WorkItemTypeIcon } from "../../workitems/workitem.icons";

export class WorkItemComposite {
  public readonly workItemType: string;
  public readonly workItemId: number;
  public readonly workItemTitle: string;
  public readonly workItemIcon: string;
  public readonly url: string;

  private readonly _fallBackIconUrl =
    "https://tfsprodcus3.visualstudio.com/_apis/wit/workItemIcons/icon_book?color=009CCC&v=2";

  constructor(
    workItem: WorkItem,
    workItemTypeIcons: WorkItemTypeIcon[] | null
  ) {
    this.workItemType = workItem.fields
      ? workItem.fields["System.WorkItemType"]
      : "";
    this.workItemId = workItem.fields ? workItem.fields["System.Id"] : -1;
    this.workItemTitle = workItem.fields ? workItem.fields["System.Title"] : "";

    //get index of icon from list of avaible icons for the work item type
    let i = workItemTypeIcons
      ? workItemTypeIcons.findIndex(x => x.type === this.workItemType)
      : 0;

    this.workItemIcon = workItemTypeIcons
      ? workItemTypeIcons[i].url.toString()
      : this._fallBackIconUrl;
    this.url = workItem._links.html.href;
  }
}
