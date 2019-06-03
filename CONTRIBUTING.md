# Azure Boards Extension Contributor Guide

The instructions below will help you set up your development environment to contribute to this repository.
Make sure you've already cloned the repo. :smile:

## Ways to Contribute

Interested in contributing to the azure-boards-vscode project? There are plenty of ways to contribute, all of which help make the project better.

- Submit a [bug report](https://github.com/microsoft/azure-boards-vscode/issues/new) or [feature request](https://github.com/microsoft/azure-boards-vscode/issues/new) through the Issue Tracker
- Review the [source code changes](https://github.com/microsoft/azure-boards-vscode/pulls)
- Submit a code fix for a bug (see [Submitting Pull Requests](#submitting-pull-requests) below)
- Participate in [discussions](https://github.com/microsoft/azure-boards-vscode/issues)

## Set up Node, npm and gulp

### Node and npm

**Windows and Mac OSX**: Download and install node from [nodejs.org](http://nodejs.org/)

**Linux**: Install [using package manager](https://nodejs.org/en/download/package-manager/)

From a terminal ensure at least node 8.11.3 and npm 6.9.0:

```bash
$ node -v && npm -v
v8.11.3
6.9.0
```

**Note**: To get npm version 6.9.0, you may need to update npm after installing node. To do that:

```bash
[sudo] npm install npm -g
```

From the root of the repo, install all of the build dependencies:

```bash
[sudo] npm install --greedy
```

## Build and run locally

Hit F5 in VS Code.

## Code Structure

The code is structured between the Visual Studio Code extension file, the Azure Boards extension object, and the clients, contexts, helpers and services.

### Visual Studio Code Extension file

This is the file with the code called by Visual Studio Code to bootstrap the extension. **extension.ts** should be thin and delegate to the Azure Boards Extension object.

### Azure Boards Extension object

This is the object intended to have small methods that call to the feature-specific clients that manipulate the UI and make calls to Azure DevOps via the service objects. When adding new commands, the functions that are called should be defined here.

## Debugging

To debug the extension, make sure you've installed all of the npm packages as instructed earlier. Then, open the root of the repository in Visual Studio Code and press F5. If you have the extension already installed, you'll need to uninstall it via the Command Palette and try again.

## Code Styles

1. Build commands will run `tslint` and flag any errors. Please ensure that the code stays clean.
2. All source files must have the following lines at the top:

```
 /*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See LICENSE in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
```

3. We keep LF line-endings on the server. Please set the `core.safecrlf` git config property to true.

```
git config core.safecrlf true
```

## Packaging and releasing

1. Increment the extension version in `package.json`
2. Run `npm install -g vsce`
3. Run `vsce package`
4. Create and upload the package to a new GitHub release on the repo

See the [Publishing Extension](https://code.visualstudio.com/api/working-with-extensions/publishing-extension) Visual Studio Code documentation for more information.

## Contribution License Agreement

In order to contribute, you will need to sign a [Contributor License Agreement](https://cla.microsoft.com/).

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Submitting Pull Requests

We welcome pull requests! Fork this repo and send us your contributions. Go [here](https://help.github.com/articles/using-pull-requests/) to get familiar with GitHub pull requests.
