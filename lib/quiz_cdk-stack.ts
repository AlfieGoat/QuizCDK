import { App, Stack, StackProps } from "@aws-cdk/core";
import { QuizApiConstruct } from "./quizApi";
import { QuizAuthenticationConstruct } from "./quizAuthentication";
import { HostedZoneConstruct } from "./quizHostedZone";
import { QuizStaticSiteCdkStack } from "./quizStaticWebsiteCDK";

export interface QuizStackProps extends StackProps {
  cognitoCallbackUrl?: string;
  cognitoDomainPrefix: string;
  domain?: string;
  region: string;
  websiteCertificatePrefix?: string;
  apiCertificatePrefix: string;
  staticSiteAssetsPath: string;
  userPoolGroups: string[];
  schemaPath: string;
}
export class QuizStack extends Stack {
  private readonly quizAuthenticationConstruct: QuizAuthenticationConstruct;
  private readonly quizHostedZoneConstruct: HostedZoneConstruct;
  private readonly quizStaticSiteConstruct: QuizStaticSiteCdkStack;
  private readonly quizGraphQLApi: QuizApiConstruct;

  constructor(scope: App, id: string, props: QuizStackProps) {
    super(scope, `${id}-QuizStack`, props);

    if (props.domain && props.websiteCertificatePrefix) {
      this.quizHostedZoneConstruct = new HostedZoneConstruct(
        this,
        `QuizHostedZoneConstruct`,
        {
          certificatePrefixes: [
            props.websiteCertificatePrefix,
            props.apiCertificatePrefix,
          ],
          domain: props.domain,
          region: props.region,
        }
      );
    }

    const certificate = props.websiteCertificatePrefix
      ? {
          certificate:
            this.quizHostedZoneConstruct.certificates[
              props.websiteCertificatePrefix
            ],
        }
      : {};

    this.quizStaticSiteConstruct = new QuizStaticSiteCdkStack(
      this,
      "QuizStaticSiteConstruct",
      {
        ...certificate,
        domain: props.domain,
        domainPrefix: props.websiteCertificatePrefix,
        staticSiteAssetsPath: props.staticSiteAssetsPath,
        hostedZone: this.quizHostedZoneConstruct?.hostedZone,
      }
    );
    const callbackUrl = props.cognitoCallbackUrl ?? `https://${this.quizStaticSiteConstruct.nextJSLambdaEdge.distribution.domainName}`
    
    this.quizAuthenticationConstruct = new QuizAuthenticationConstruct(
      this,
      `QuizAuthenticationConstruct`,
      {
        callbackUrls: [callbackUrl],
        cognitoDomainPrefix: props.cognitoDomainPrefix,
      }
    );

    props.userPoolGroups.forEach((groupName) =>
      this.quizAuthenticationConstruct.addGroup(
        `${QuizAuthenticationConstruct}.${groupName}`,
        groupName
      )
    );

    this.quizGraphQLApi = new QuizApiConstruct(this, "QuizApiConstruct", {
      schemaPath: props.schemaPath,
      userPool: this.quizAuthenticationConstruct.userPool,
    });
  }
}
