# Azure Functions based CORS Proxy for Native Authentication APIs  using Azure Developer CLI

This repository contains an Azure Functions HTTP trigger reference sample written in JavaScript and deployed to Azure using Azure Developer CLI (`azd`). The sample uses managed identity and a virtual network to make sure deployment is secure by default.

## Prerequisites

+ [Azure Developer CLI (`azd`)](https://learn.microsoft.com/azure/developer/azure-developer-cli/install-azd)

## Deployment

1. Run the following command to initialize the project.

```bash
azd init --template https://github.com/azure-samples/ms-identity-extid-cors-proxy-function
```

This command will clone the code to your current folder and prompt you for the following information:

- `Environment Name`: This will be used as a prefix for the resource group that will be created to hold all Azure resources. This name should be unique within your Azure subscription.

2. Run the following command to build a deployable copy of your application, provision the template's infrastructure to Azure and also deploy the application code to those newly provisioned resources.

```bash
azd up
```

This command will prompt you for the following information:
- `Azure Location`: The Azure location where your resources will be deployed.
- `Azure Subscription`: The Azure Subscription where your resources will be deployed.
- `corsAllowedOrigin` parameter: The origin domain to allow CORS requests from in the format of `SCHEME://DOMAIN:PORT`, e.g. `http://localhost:3000`.
- `tenantSubdomain` parameter: The subdomain of the External ID tenant that we will proxy (This is the portion of the primary domain before the .onmicrosoft.com part, e.g. mytenant).

> NOTE: This may take a while to complete as it executes three commands: `azd package` (builds a deployable copy of your application), `azd provision` (provisions Azure resources), and `azd deploy` (deploys application code). You will see a progress indicator as it packages, provisions and deploys your application.

Once it is deployed, you should see the Endpoint of the deployed proxy, e.g.

``` bash
Deploying services (azd deploy)

  (✓) Done: Deploying service proxy
  - Endpoint: https://func-proxy-eklrf2yt64zyg.azurewebsites.net/
```

You can then use this endpoint from your Single Page Application. The Native Authentication APIs with CORS headers enabled will be available at `<ENDPOINT>`.

For more on how to deploy and update the running application, checkout the [Azure Dev CLI documentation for more instructions on using the CLI](https://docs.microsoft.com/en-us/azure/developer/azure-developer-cli/get-started).

## Developer Instructions
+ To use Visual Studio Code to run and debug locally:
  + [Node.js 20](https://www.nodejs.org/)
  + [Azure Functions Core Tools](https://learn.microsoft.com/azure/azure-functions/functions-run-local?pivots=programming-language-javascript#install-the-azure-functions-core-tools)
  + [Visual Studio Code](https://code.visualstudio.com/)
  + [Azure Functions extension](https://marketplace.visualstudio.com/items?itemName=ms-azuretools.vscode-azurefunctions)
  + An HTTP test tool that keeps your data secure - see [HTTP test tools](https://learn.microsoft.com/azure/azure-functions/functions-develop-local#http-test-tools).

## Prepare your local environment

Add a file named `local.settings.json` in the root of your project with the following contents:

```json
{
    "IsEncrypted": false,
    "Values": {
        "AzureWebJobsStorage": "UseDevelopmentStorage=true",
        "FUNCTIONS_WORKER_RUNTIME": "node",
        "TENANT_SUBDOMAIN": "<INSERT YOUR TENANT SUBDOMAIN HERE>"
    },
    "Host": {
        "LocalHttpPort": 7071,
        "CORS": "<INSERT ALLOWED CORS ORIGIN HERE>"
    }
}
```

where the CORS Origin will be of the form `PROTOCOL://HOSTNAME:SCHEME`, e.g. `http://localhost:3000`.

## Run your app from the terminal

1. Run these commands to start the Functions host locally:

    ```shell
    npm install
    func start
    ```

1. Test the HTTP POST trigger with a payload using your favorite secure HTTP test tool. The proxy will be available at `http://localhost:7071/`.

1. When you're done, press Ctrl+C in the terminal window to stop the `func.exe` host process.

## Deploy to Azure

Run this command to provision the function app, with any required Azure resources, and deploy your code:

```shell
azd up
```

You're prompted to supply these required deployment parameters:

| Parameter | Description |
| ---- | ---- |
| _Environment name_ | An environment that's used to maintain a unique deployment context for your app. You won't be prompted if you created the local project using `azd init`.|
| _Azure subscription_ | Subscription in which your resources are created.|
| _Azure location_ | Azure region in which to create the resource group that contains the new Azure resources. Only regions that currently support the Flex Consumption plan are shown.|
| _corsAllowedOrigin_ | The origin domain to allow CORS requests from in the format of `SCHEME://DOMAIN:PORT`, e.g. `http://localhost:3000`.|
| _tenantSubdomain_ | The subdomain of the External ID tenant that we will proxy (This is the portion of the primary domain before the .onmicrosoft.com part, e.g. mytenant).|

## Redeploy your code

You can run the `azd up` command as many times as you need to both provision your Azure resources and deploy code updates to your function app.

>[!NOTE]
>Deployed code files are always overwritten by the latest deployment package.

## Using the reverse proxy

You can configure your single page application to use the `Service endpoint` as the URL prefix for your Native Authentication endpoints.  This will be of the form `https://func-proxy-XXXXXX.azurewebsites.net` where `XXXX` is replaced with a random string, for example:


```shell
Deploying services (azd deploy)

  (✓) Done: Deploying service proxy
  - Endpoint: https://func-proxy-n6urdpomcocly.azurewebsites.net/
```

## Clean up resources

When you're done working with your function app and related resources, you can use this command to delete the function app and its related resources from Azure and avoid incurring any further costs:

```shell
azd down
```
