import {
  CfnUserPoolGroup,
  IUserPool,
  IUserPoolClient,
  OAuthScope,
  UserPool,
  UserPoolClientIdentityProvider,
  UserPoolDomain,
} from "@aws-cdk/aws-cognito";
import { Construct } from "@aws-cdk/core";

interface QuizAuthenticationConstructProps {
  callbackUrls: string[];
  cognitoDomainPrefix: string;
}

export class QuizAuthenticationConstruct extends Construct {
  public readonly userPool: IUserPool;
  public readonly userPoolClient: IUserPoolClient;
  public readonly userPoolDomain: UserPoolDomain;
  public readonly userPoolGroups: CfnUserPoolGroup[] = [];
  constructor(
    scope: Construct,
    id: string,
    { callbackUrls, cognitoDomainPrefix }: QuizAuthenticationConstructProps
  ) {
    super(scope, id);

    this.userPool = new UserPool(this, `${id}.userPool`);

    this.userPoolClient = this.userPool.addClient(`${id}.userPoolClient`, {
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
      oAuth: {
        scopes: [OAuthScope.OPENID, OAuthScope.PROFILE],
        callbackUrls: [
          ...callbackUrls
        ],
      }
    });

    this.userPoolDomain = this.userPool.addDomain(`${id}.userPoolDomain`, {
      cognitoDomain: {
        domainPrefix: cognitoDomainPrefix,
      },
    });
  }

  public addGroup(id: string, groupName:string){
    this.userPoolGroups.push(new CfnUserPoolGroup(this, id, {
      userPoolId: this.userPool.userPoolId,
      groupName
    }))
  }
}
