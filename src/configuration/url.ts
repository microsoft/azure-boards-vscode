// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License. See LICENSE in the project root for license information.

export function isValidAzureBoardsUrl(url: string): boolean {
  url = url.toLocaleLowerCase();

  return (
    url.startsWith("https://dev.azure.com/") ||
    (url.startsWith("https://") && url.indexOf(".visualstudio.com") >= 0)
  );
}
