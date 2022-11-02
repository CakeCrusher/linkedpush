# linkedpush ([site](https://linkedpush.herokuapp.com/))

Converts your GitHub pushes to LinkedIn posts, to maximize exposure.

https://user-images.githubusercontent.com/37946988/199383076-d43f5c3d-af90-4b84-83ac-97a24d57ceb8.mp4

![firstpost](https://user-images.githubusercontent.com/37946988/196016831-eed2e908-7184-4d89-97df-7a958c734868.JPG)

## How it works

[Sequence diagram](https://www.figma.com/file/KCPxw3HuMQmCsTS3MwhgaZ/linkedpush?node-id=0%3A1)

![sequence-diagram](https://user-images.githubusercontent.com/37946988/196039623-5bc97e03-4ad2-4800-8354-ad84c42a4c0b.JPG)

## Setup

### 0. Clone this repository.

### 1. `.env` setup.

The application `PORT` is set to default `3000`. You can change it if you want.

1. Rename the `.env-template` file to `.env`.
2. Expose (deploy) this repository to the internet using through whatever means you prefer. I recommend [ngrok](https://ngrok.com/), you must initiate it to your `PORT`. This link will be your `REDIRECT_URL`, you will need it for the following steps as well.

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
4. Set the "Payload URL" to your exposed root URL + `/api/publish`. Change "Content Type" to "application/json". "Add webhook" to submit.
   ![github-4](https://user-images.githubusercontent.com/37946988/196016752-ec1ddc46-6deb-466d-9faa-99230929d032.png)

### 4. linkedpush setup.

1. Run `yarn install` or `npm install` to install the dependencies.
2. Run `yarn dev` or `npm run dev` to start the server.
3. Navigate to your exposed root URL + `/api/auth-url`.
4. Sign in to LinkedIn and authorize the app.

### 5. You're set 🥳!

1. Simply commit with the `@linkedpush` string in the commit text (don't worry `@linkedpush` will be removed from the post text).
2. Push.
3. Your commit message will be transformed into a LinkedIn post!

## Troubleshooting

- Your token is stored in the server's memory, so if you restart the server, you will need to re-authorize the app.
- There are certain characters that are not allowed when posting via the API so the post will not go through. Here are some of them: `\n`, `\r`, `\t`, possibly more. The following characters are automatically removed by linkedpush so that the post goes through: `(`,`)`,`@`.
