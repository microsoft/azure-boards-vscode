# Azure Boards Extension for Visual Studio Code

![Build Status](https://cs-extensions.visualstudio.com/Azure%20Boards%20VS%20Code/_apis/build/status/Azure%20Boards%20VS%20Code-CI?branchName=master)

[description]

[screenshot]

:tv: Watch a [walkthrough of the Azure Boards extension for Visual Studio Code]() that shows many of the features of the extension.

## Prerequisites

### Azure DevOps Services

If you are using the extension with Azure DevOps Services, ensure you have an Azure DevOps Services organization. If you do
not have one, [sign up for Azure DevOps Services](https://aka.ms/SignupAzureDevOps/?campaign=azure~boards~vscode~readme).

### Team Foundation Server

If you are planning on using the extension with Team Foundation Server, you **must** be running Team Foundation
Server 2015 Update 2 or later. Earlier versions of Team Foundation Server are not supported.

### [feature 1]

[feature 1 description]

## Installation

First, you will need to install [Visual Studio Code](https://code.visualstudio.com/download) `1.12.0` or later.

To install the extension with the latest version of Visual Studio Code (version 1.13.1 is the latest as of this writing), bring up the Visual Studio Code Command Palette (`F1`), type `install` and choose `Extensions: Install Extensions`. In the `Search Extensions in Marketplace` text box, type `team`. Find the `Azure Boards` extension published by *Microsoft* and click the `Install` button. Restart Visual Studio Code.

## Authentication

### Azure DevOps Services

If you are connecting to Azure DevOps Services, you will need a personal access token (PAT). With the release of v1.121.0 of the extension, you have a choice of whether you would like to create a token yourself manually and provide it when prompted, or use a new experience in which you are authenticated to Azure DevOps Services using your web browser. In the new experience, a personal access token is still created on your behalf but only after you are authenticated. The created token has *All Scopes* permissions but can be updated in your profile settings. Both tokens (manual or the new experience) are stored securely on your machine.

#### Manual Token Creation

Should you wish to create a personal access token yourself, go [here](https://aka.ms/gtgzt4) to read how. You can also [view our video](https://youtu.be/t6gGfj8WOgg) on how to do the same.
* Git repositories require that you create your token with the **Build (read)**, **Code (read)** and **Work items (read)** scopes to ensure full functionality. You can also use *All Scopes*, but the minimum required scopes are those listed above.
* TFVC repositories require tokens with *All Scopes*. Anything less will cause the extension to fail.

#### Browser-based Authentication

When using the new authentication experience, you will be prompted to copy a *device code* used to identify yourself to the authentication system. Once you accept the prompt to begin authentication, your default web browser will be opened to a login page. After supplying that device code and having it verified, you will then be prompted to authenticate with Azure DevOps Services normally (e.g., username and password, multi-factor authentication, etc.). Once you are authenticated to Azure DevOps Services, a personal access token will be created for you and the extension will be initialized normally. To see what this experience is like, [view this video](https://youtu.be/HnDNdm1WCIo).

### Team Foundation Server

If you are connecting to Team Foundation Server, you will only need your NTLM credentials (domain name, server name and password). It is assumed that you have the proper permissions on the TFS Server.

Details on how to connect to either Azure DevOps Services or Team Foundation Server are found in the next section.

## Status Bar Indicators

* ![Team Project indicator](assets/project-indicator.png) – This status bar item is populated with the name
of the team project to which the repository belongs. Clicking on the item will open your browser to the team website.

* ![Feedback indicator](assets/feedback-indicator.png) – Clicking this status bar item allows you to quickly send
feedback about the Azure Boards extension.

## Commands

In addition to the status bar integrations, the extension also provides several commands for interacting with
Azure DevOps Services and Team Foundation Server. In the Command Palette (`F1`), type `team` and choose a command.

[command descriptions]

## Secure Credential Storage

When you run the `team signin` command, the credentials that you provide will be stored securely on your computer. On
Windows, your credentials wil be stored by Windows Credential Manager. On macOS, your credentials will be stored in the
Keychain. On Linux, your credentials will be stored in a file on your local file system in a subdirectory of your
home folder. That file is created only with RW rights for the user running Visual Studio Code. It is **not encrypted**
on disk.

## How to disable telemetry reporting

The Azure Boards extension collects usage data and sends it to Microsoft to help improve our products
and services. Read our [privacy statement](http://go.microsoft.com/fwlink/?LinkId=528096&clcid=0x409) to learn more.

If you don’t wish to send usage data to Microsoft, add the following entry to Settings (**File > Preferences > Settings**):
```javascript
    "team.appInsights.enabled": "false"
```

## Logging

There may be times when you need to enable file logging to troubleshoot an issue. There are five levels of logging (`error`,
`warn`, `info`, `verbose` and `debug`). Since logging is disabled by default, you can add an entry like the one shown below
to Visual Studio Code's Settings. Once you are finished logging, either remove the setting or set it to an empty string.
```javascript
"team.logging.level": "debug"
```
The log file will be placed at the root of your workspace and will be named `team-extension.log`.

### Private builds

In order to facilitate more debugging, you may be provided with a "private build" of the extension. The private build will
likely come in the form of a .ZIP file named similarly to the VSIX that gets deployed to the Marketplace (e.g., `team-0.117.0.vsix.zip`).

To install the private build, you must uninstall the previous version and then _side load_ the new one. First, remove the
.ZIP extension from the file and then follow [these instructions](https://code.visualstudio.com/docs/editor/extension-gallery#_install-from-a-vsix) to install the VSIX.

## Support

Support for this extension is provided on our [GitHub Issue Tracker](https://github.com/Microsoft/azure-boards-vscode/issues). You
can submit a [bug report](https://github.com/Microsoft/azure-boards-vscode/issues/new), a [feature request](https://github.com/Microsoft/azure-boards-vscode/issues/new)
or participate in [discussions](https://github.com/Microsoft/azure-boards-vscode/issues).

## Contributing to the Extension

See the [developer documentation](CONTRIBUTING.md) for details on how to contribute to this extension.

## Code of Conduct

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). For more information see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## Privacy Statement

The [Microsoft Visual Studio Product Family Privacy Statement](http://go.microsoft.com/fwlink/?LinkId=528096&clcid=0x409)
describes the privacy statement of this software.

## License

This extension is [licensed under the MIT License](LICENSE.txt). Please see the [third-party notices](ThirdPartyNotices.txt)
file for additional copyright notices and license terms applicable to portions of the software.
