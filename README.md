# AWS Management Stack

CDK stack to manage my AWS Account

## Features

- check-access-tokens: A lambda function that checks if any iam access keys in my account are older than 60 days and if such notify me over discord to rotate said keys.
- check-node-lambdas: A lambda function that checks my nodejs lambda functions to see if any are using outdated runtimes.
