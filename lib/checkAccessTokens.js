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

class CheckAccessToken extends Construct {
  constructor(scope, id, opts) {
    super(scope, id);
    this.fn = new Function(this, "CheckAccessTokenFn", {
      code: Code.fromAsset(
        path.join(__dirname, "..", "lambdas", "check-access-tokens")
      ),
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
      new Policy(this, "IAMPolicy", {
        statements: [
          new PolicyStatement({
            actions: ["iam:listUsers", "iam:listAccessKeys"],
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

    const checkAccessTokenSchedule = new Rule(
      this,
      `CheckAccessTokenSchedule`,
      {
        schedule: Schedule.expression("cron(0 0 * * ? *)"),
      }
    );

    checkAccessTokenSchedule.addTarget(new LambdaFunction(this.fn));
  }
}

module.exports = { CheckAccessToken };
