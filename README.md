# linkedpush

Converts your GitHub pushes to LinkedIn posts, to maximize exposure.

## How it works

[Sequence diagram](https://www.figma.com/file/KCPxw3HuMQmCsTS3MwhgaZ/linkedpush?node-id=0%3A1)

![sequence diagram](https://user-images.githubusercontent.com/37946988/196015887-be44d400-12f7-4de7-b9c4-19b68f8418f4.png)

## Setup

### 1. `.env` setup.

1. Rename the `.env-template` file to `.env`.
2. Expose (deploy) this repository to the internet using through whatever means you prefer. I recommend [ngrok](https://ngrok.com/). This link will be your `REDIRECT_URL`, you will need it for the following steps as well.

### 2. Create a LinkedIn App.

1. Create a LinkedIn developer account.
2. Create a [new app](https://www.linkedin.com/developers/apps).
   ![linkedin-1](https://user-images.githubusercontent.com/37946988/196014978-47752272-380f-4d26-8c94-f5ff9efbc0d1.png)
3. Fill in the required fields (you will need a company page, you can set it up [here](https://www.linkedin.com/company/setup/new/) if you don't have one).
4. Request access to all 3 products.
   ![linkedin-2](https://user-images.githubusercontent.com/37946988/196014993-5cf8b017-79a5-4fb8-9ca7-5576130490c9.png)
5. Navigate to "Auth". Add the "Client ID" and the "Client Secret" to the `.env` file accordingly. Add a redirect URL which will be your exposed root URL + `/api/auth`. "Update" the redirect URL.
   ![linkedin-3](https://user-images.githubusercontent.com/37946988/196014998-bdedeb8b-7579-4143-b452-7061cacc1cf4.png)

### 3. Create a GitHub webhook on your repository.

1. Navigate to your repository's settings.
   ![github-1](https://user-images.githubusercontent.com/37946988/196015015-a153509a-c871-4b7f-971c-da3c32736fe0.png)
2. Navigate to "Webhooks".
   ![github-2](https://user-images.githubusercontent.com/37946988/196015021-ed12b6ed-92dd-4e34-940a-0fc561a6fb35.png)
3. Add a new webhook.
   ![github-3](https://user-images.githubusercontent.com/37946988/196015025-58602a5c-734e-48b0-a5a6-338070bd3246.png)
4. Set the "Payload URL" to your exposed root URL + `/api/publish`. "Add webhook" to submit.
   ![github-4](https://user-images.githubusercontent.com/37946988/196016322-94b6990f-1295-427e-9c50-f083fd8e97fc.png)

### 4. linkedpush setup.

1. Navigate to your exposed root URL + `/api/auth-url`.
2. Sign in to LinkedIn and authorize the app.

### 5. You're set 🥳!

1. Simply commit with the `@linkedpush` string in the commit text (don't worry `@linkedpush` will be removed from the post text).
2. Push.
3. Your commit message will be transformed into a LinkedIn post!

## Troubleshooting

- Your token is stored in the server's memory, so if you restart the server, you will need to re-authorize the app.
- There are certain characters that are not allowed when posting via the API so the post will not go through. Here are some of them: `\n`, `\r`, `\t`, possibly more. The following characters are automatically removed by linkedpush so that the post goes through: `(`,`)`,`@`.
