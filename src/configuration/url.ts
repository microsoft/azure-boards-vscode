export function isValidAzureBoardsUrl(url: string): boolean {
  url = url.toLocaleLowerCase();

  return (
    url.startsWith("https://dev.azure.com/") ||
    (url.startsWith("https://") && url.indexOf(".visualstudio.com") >= 0)
  );
}
