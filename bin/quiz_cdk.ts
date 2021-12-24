#!/usr/bin/env node
import 'source-map-support/register';
import { QuizStack } from '../lib/quiz_cdk-stack';
import { QuizApiConstruct } from '../lib/quizApi';

import * as cdk from '@aws-cdk/core'

const ENVIRONMENT = {
  region: 'us-east-1',
}

const COGNITO_CALLBACK_URL = 'https://quiz.aggoatch.people.amazon.dev'
const COGNITO_DOMAIN_PREFIX = 'quiz-aggoatch'
const DOMAIN = 'aggoatch.people.amazon.dev'
const WEBSITE_CERTIFICATE_PREFIX = 'quiz';
const API_CERTIFICATE_PREFIX = 'api';
const STATIC_SITE_ASSETS_PATH = '../QuizStaticWebsiteLambda/build'
const NEXT_JS_ASSETS = '../QuizWebsite/build'
const USER_POOL_GROUPS = ['admin', 'moderator', 'user'];
const SCHEMA_PATH = 'lib/schema.graphql'

const app = new cdk.App();
new QuizStack(app, 'aggoatch', {
  callbackUrls: [COGNITO_CALLBACK_URL],
  region: ENVIRONMENT.region,
  cognitoDomainPrefix: COGNITO_DOMAIN_PREFIX,
  description: "Quiz Stack for a quiz website",
  domain: DOMAIN,
  websiteCertificatePrefix: WEBSITE_CERTIFICATE_PREFIX,
  apiCertificatePrefix: API_CERTIFICATE_PREFIX,
  staticSiteAssetsPath: NEXT_JS_ASSETS,
  stackName: 'aggoatch-quiz-stack',
  env: ENVIRONMENT,
  userPoolGroups: USER_POOL_GROUPS,
  schemaPath: SCHEMA_PATH
});
