import * as React from "react";
import "./app.css";

const SettingsView = React.lazy(() => import("./settings/index"));

export const Router: React.FC<{ route: string }> = ({ route }) => {
  switch (route) {
    case "settings":
      return <SettingsView />;
    default:
      throw new Error("Unknown route");
  }
};
