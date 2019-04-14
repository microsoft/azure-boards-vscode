import * as React from "react";
import { AzureBoardsLogo } from "../components/logo";

export default () => {
  return (
    <div className="page">
      <h1>
        <AzureBoardsLogo /> Configure Azure Boards
      </h1>

      <h2>Select your account</h2>
      <button>Click here to sign in</button>
    </div>
  );
};
