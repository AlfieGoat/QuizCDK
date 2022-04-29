# Quiz CDK deployment package

## Example
If you want to use the site, but not deploy it yourself, you can visit https://quiz.aggoatch.people.amazon.dev/.

### Users
There are three different access level accounts: `alfieadmin`, `alfiemoderator`, `alfieuser`
The password for all three accounts is `Password-1`

## Instructions

### Pre-requisites
1. You must have the QuizWebsite package in your workspace 
2. You must have built the QuizWebsite package
3. You have your own AWS account
4. You have your AWS account credentials setup locally
5. You have npm installed

### deployment instructions
1. Go to `bin/quiz_cdk.ts` 
2. Change the cognito domain prefix to something else unique and note it down (e.g `${your-name}-quiz-project`)
3. run `npm i`
4. run `npx cdk deploy no-domain-quiz-QuizStack`
5. note down the endpoint URL in the terminal where you just ran your command e.g `https://ubcu4la7yzb3zmkzthx5pq3qf4.appsync-api.us-east-1.amazonaws.com/graphql`
6. Go to the AWS console -> Cloudformation and find your new stack named no-domain-quiz
7. Go to resources and find the Cognito user pool -> App client settings.
8. Note down the App client ID (e.g `1q26p2fm9rpm26mjbd231j8g4b`), and the callback url (e.g `https://d33qosxmh0yrxf.cloudfront.net`)
9. Go to the QuizWebsite package and into utils/constants.ts
10. Set the `GRAPHQL_API_URL` const to the endpoint URL you noted down
11. Set the `COGNITO_PREFIX` const to the cognito domain prefix
12. Set the `COGNITO_CLIENT_ID` const to the app ID that you noted down
13. Set the `STATIC_SITE_URL` to the callback URL you noted down
14. Rebuild the QuizWebsite package (`npm run build`)
15. Re-deploy the QuizCDK (`npx cdk deploy no-domain-quiz-QuizStack`)
16. Go back to the Cognito page in your AWS account and go to users and groups
17. Create a new User and add them to the `admin` group
18. Receive your temporary password in your email.
19. Go to your cloudfront URL (The callback URL you wrote down earlier)
20. Use the new user you just created to login

Voila! You have a fully deployed quiz website!
