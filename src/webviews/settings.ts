import { BaseReactPanel } from "./webview";

export class SettingsPanel extends BaseReactPanel {
  protected getRoute(): string {
    return "settings";
  }

  protected getTitle(): string {
    return "Azure Boards Settings";
  }
}
