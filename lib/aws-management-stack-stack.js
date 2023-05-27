const { Stack } = require("aws-cdk-lib");
const { CheckAccessToken } = require("./checkAccessTokens");
const { CheckNodeLambdas } = require("./checkNodeLambdas");

require("dotenv").config();

class AwsManagementStackStack extends Stack {
  /**
   *
   * @param {Construct} scope
   * @param {string} id
   * @param {StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);

    new CheckAccessToken(this, "CheckAccessToken", {});
    new CheckNodeLambdas(this, "CheckNodeLambdas", {});
  }
}

module.exports = { AwsManagementStackStack };
