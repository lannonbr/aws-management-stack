const {
  LambdaClient,
  ListFunctionsCommand,
  InvokeCommand,
} = require("@aws-sdk/client-lambda");

const dayjs = require("dayjs");

const lambdaClient = new LambdaClient({
  region: "us-east-1",
});

exports.handler = async function run() {
  const listFunctionsResp = await lambdaClient.send(
    new ListFunctionsCommand({})
  );

  const today = dayjs();

  const versions = await fetch(
    "https://raw.githubusercontent.com/nodejs/Release/main/schedule.json"
  ).then((resp) => resp.json());

  const oldFunctions = listFunctionsResp.Functions.filter((fn) => {
    return fn.Runtime.startsWith("nodejs");
  }).filter((fn) => {
    const nodeVersion = `v${fn.Runtime.split("nodejs")[1].split(".x")[0]}`;

    const versionEndDate = dayjs(versions[nodeVersion].end);

    return versionEndDate.diff(today, "days") < 0;
  });
  for (let fn of oldFunctions) {
    await lambdaClient.send(
      new InvokeCommand({
        FunctionName: "SendMessageOverDiscordWebhook",
        Payload: JSON.stringify({
          discordWebookURL: process.env.DISCORD_WEBHOOK_URL,
          message: `NOTICE: The lambda function ${fn.FunctionName} is using a deprecated version of Nodejs: ${fn.Runtime}`,
        }),
      })
    );
  }

  return {
    stausCode: 200,
    body: JSON.stringify({ message: "DONE" }),
  };
};
