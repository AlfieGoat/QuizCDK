import { App, Stack, StackProps } from "@aws-cdk/core";
import { QuizApiConstruct } from "./quizApi";
import { QuizAuthenticationConstruct } from "./quizAuthentication";
import { HostedZoneConstruct } from "./quizHostedZone";
import { QuizStaticSiteCdkStack } from "./quizStaticWebsiteCDK";

export interface QuizStackProps extends StackProps {
  callbackUrls: string[];
  cognitoDomainPrefix: string;
  domain: string;
  region: string;
  websiteCertificatePrefix: string;
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
    this.quizAuthenticationConstruct = new QuizAuthenticationConstruct(
      this,
      `QuizAuthenticationConstruct`,
      {
        callbackUrls: props.callbackUrls,
        cognitoDomainPrefix: props.cognitoDomainPrefix,
      }
    );

    props.userPoolGroups.forEach(groupName => this.quizAuthenticationConstruct.addGroup(`${QuizAuthenticationConstruct}.${groupName}`, groupName))

    this.quizHostedZoneConstruct = new HostedZoneConstruct(this, `QuizHostedZoneConstruct`, {
      certificatePrefixes: [props.websiteCertificatePrefix, props.apiCertificatePrefix],
      domain: props.domain,
      region: props.region
    })

    this.quizStaticSiteConstruct = new QuizStaticSiteCdkStack(this, 'QuizStaticSiteConstruct', {
      certificate: this.quizHostedZoneConstruct.certificates[props.websiteCertificatePrefix],
      domain: props.domain,
      domainPrefix: props.websiteCertificatePrefix,
      staticSiteAssetsPath: props.staticSiteAssetsPath
    })

    this.quizHostedZoneConstruct.addARecord(this.quizStaticSiteConstruct.getHttpApiTarget(), `QuizStaticSiteHttpApiTarget`, props.websiteCertificatePrefix)

    this.quizGraphQLApi = new QuizApiConstruct(this, 'QuizApiConstruct', {
      schemaPath: props.schemaPath,
      userPool: this.quizAuthenticationConstruct.userPool
    })
  }
}
