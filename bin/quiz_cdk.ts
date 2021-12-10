#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { QuizStaticSiteCdkStack } from '../lib/quiz_cdk-stack';

const ENVIRONMENT = {
  region: 'us-east-1',
}

const app = new cdk.App();
new QuizStaticSiteCdkStack(app, 'QuizCdkStack', {
  env: ENVIRONMENT,
  description: "Quiz Stack for a quiz website",
  domain: "aggoatch.people.amazon.dev"
});