import * as React from "react";
import * as ReactDOM from "react-dom";
import { Router } from "./webviews/router";

const route: string = (document.getElementById(
  "route"
) as HTMLMetaElement).getAttribute("value")!;

ReactDOM.render(
  <React.Suspense fallback={"Loading..."}>
    <Router route={route} />
  </React.Suspense>,
  document.getElementById("root") as HTMLElement
);
