/**
 *  Copyright 2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 *  Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance
 *  with the License. A copy of the License is located at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  or in the 'license' file accompanying this file. This file is distributed on an 'AS IS' BASIS, WITHOUT WARRANTIES
 *  OR CONDITIONS OF ANY KIND, express or implied. See the License for the specific language governing permissions
 *  and limitations under the License.
 */

// Imports
import { App, Stack } from "aws-cdk-lib";
import { IotToSqs, IotToSqsProps } from "../lib";
import * as iam from 'aws-cdk-lib/aws-iam';
import * as kms from 'aws-cdk-lib/aws-kms';
import { generateIntegStackName } from '@aws-solutions-constructs/core';

// Setup
const app = new App();
const stack = new Stack(app, generateIntegStackName(__filename));
stack.templateOptions.description = 'Integration Test for aws-iot-sqs';

// Definitions
const kmsKey = new kms.Key(stack, 'existing-key', {
  enableKeyRotation: true,
  alias: 'existing-key-alias'
});

const props: IotToSqsProps = {
  encryptionKey: kmsKey,
  iotTopicRuleProps: {
    topicRulePayload: {
      ruleDisabled: false,
      description: "Processing messages from IoT devices or factory machines",
      sql: "SELECT * FROM 'test/topic/#'",
      actions: []
    }
  }
};

const iotToSqsStack = new IotToSqs(stack, 'test-iot-sqs-stack', props);

// Grant yourself permissions to use the Customer Managed KMS Key
const policyStatement = new iam.PolicyStatement({
  actions: ["kms:Encrypt", "kms:Decrypt"],
  effect: iam.Effect.ALLOW,
  principals: [new iam.AccountRootPrincipal()],
  resources: ["*"]
});

iotToSqsStack.encryptionKey?.addToResourcePolicy(policyStatement);

// Synth
app.synth();
