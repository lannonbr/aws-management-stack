const {
  IAMClient,
  ListAccessKeysCommand,
  ListUsersCommand,
} = require("@aws-sdk/client-iam");
const { LambdaClient, InvokeCommand } = require("@aws-sdk/client-lambda");
const dayjs = require("dayjs");

const iamClient = new IAMClient({
  region: "us-east-1",
});
const lambdaClient = new LambdaClient({
  region: "us-east-1",
});

exports.handler = async function run() {
  const today = dayjs();

  const usersResp = await iamClient.send(new ListUsersCommand({}));

  for (let user of usersResp.Users) {
    const resp = await iamClient.send(
      new ListAccessKeysCommand({
        UserName: user.UserName,
      })
    );

    for (let key of resp.AccessKeyMetadata) {
      const keyCreationDate = dayjs(key.CreateDate);

      const diff = today.diff(keyCreationDate, "days");

      if (diff > 60) {
        console.log(
          `NOTICE: A Key for ${key.UserName} is past 60 days since it was created. Please rotate this key`
        );

        await lambdaClient.send(
          new InvokeCommand({
            FunctionName: "SendMessageOverDiscordWebhook",
            Payload: JSON.stringify({
              discordWebookURL: process.env.DISCORD_WEBHOOK_URL,
              message: `NOTICE: A Key for ${key.UserName} is past 60 days since it was created. Please rotate this key`,
            }),
          })
        );
      } else {
        console.log(
          `Access Key for user ${key.UserName} does not need to be rotated`
        );
      }
    }
  }

  return {
    stausCode: 200,
    body: JSON.stringify({ message: "DONE" }),
  };
};
