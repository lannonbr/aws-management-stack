const { Construct } = require("constructs");
const { Duration, Tags } = require("aws-cdk-lib");
const { Rule, Schedule } = require("aws-cdk-lib/aws-events");
const { LambdaFunction } = require("aws-cdk-lib/aws-events-targets");
const { Policy, PolicyStatement, Effect } = require("aws-cdk-lib/aws-iam");
const {
  Function,
  Code,
  Runtime,
  Architecture,
} = require("aws-cdk-lib/aws-lambda");
const path = require("path");

class CheckNodeLambdas extends Construct {
  constructor(scope, id, opts) {
    super(scope, id);
    this.fn = new Function(this, "CheckNodeLambdasFn", {
      code: Code.fromAsset(
        path.join(__dirname, "..", "lambdas", "check-node-lambdas")
      ),
      description:
        "A function that checks my nodejs lambda functions to see if any are using outdated runtimes",
      handler: "index.handler",
      runtime: Runtime.NODEJS_18_X,
      timeout: Duration.seconds(10),
      architecture: Architecture.ARM_64,
      environment: {
        DISCORD_WEBHOOK_URL: process.env.DISCORD_WEBHOOK_URL,
      },
      memorySize: 512,
    });

    Tags.of(this.fn).add("executableByScriptKit", "true");

    this.fn.role?.attachInlinePolicy(
      new Policy(this, "LambdaPolicy", {
        statements: [
          new PolicyStatement({
            actions: ["lambda:listFunctions"],
            effect: Effect.ALLOW,
            resources: ["*"],
          }),
        ],
      })
    );

    const SendMessageOverDiscordWebhookFn = Function.fromFunctionName(
      this,
      "SendMessageOverDiscordWebhookFn",
      "SendMessageOverDiscordWebhook"
    );

    SendMessageOverDiscordWebhookFn.grantInvoke(this.fn);

    const checkNodeLambdasSchedule = new Rule(
      this,
      `checkNodeLambdasSchedule`,
      {
        schedule: Schedule.expression("cron(0 0 * * ? *)"),
      }
    );

    checkNodeLambdasSchedule.addTarget(new LambdaFunction(this.fn));
  }
}

module.exports = { CheckNodeLambdas };
