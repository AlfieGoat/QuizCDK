import {
  IUserPool,
} from "@aws-cdk/aws-cognito";
import { AppSyncTransformer } from 'cdk-appsync-transformer';
// import { Construct } from "constructs";
import {AuthorizationType, GraphqlApi, IGraphqlApi, Schema, UserPoolDefaultAction} from "@aws-cdk/aws-appsync"

import { Construct, App } from "@aws-cdk/core";
interface QuizApiConstructProps {
  schemaPath: string;
  userPool: IUserPool;
}

export class QuizApiConstruct extends Construct {
  public readonly graphqlApi: AppSyncTransformer;

  constructor(
    scope: Construct,
    id: string,
    {
      schemaPath,
      userPool
    }: QuizApiConstructProps
  ) {
    super(scope, id);

    this.graphqlApi = new AppSyncTransformer(this, `${id}.GraphQlAPIFromTransformer`,{
      schemaPath,
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: AuthorizationType.USER_POOL,
          userPoolConfig: {
            defaultAction: UserPoolDefaultAction.ALLOW,
            userPool
          }
        },
      },
    })
  }
}
