#!/usr/bin/env node

const cdk = require('aws-cdk-lib');
const { AwsManagementStackStack } = require('../lib/aws-management-stack-stack');

const app = new cdk.App();
new AwsManagementStackStack(app, 'AwsManagementStackStack', {});
