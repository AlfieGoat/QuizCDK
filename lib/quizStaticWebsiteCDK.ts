import {
  ICertificate,
} from "@aws-cdk/aws-certificatemanager";

import {
  IHostedZone,
} from "@aws-cdk/aws-route53";
import { Construct } from "@aws-cdk/core";
import { NextJSLambdaEdge } from "@sls-next/cdk-construct";

interface QuizStaticSiteCdkStackProps {
  certificate?: ICertificate;
  domain?: string;
  domainPrefix?: string;
  staticSiteAssetsPath: string;
  hostedZone?: IHostedZone;
}

export class QuizStaticSiteCdkStack extends Construct {
  nextJSLambdaEdge: NextJSLambdaEdge;
  constructor(
    scope: Construct,
    id: string,
    {domain, domainPrefix, staticSiteAssetsPath, certificate, hostedZone} : QuizStaticSiteCdkStackProps
  ) {
    super(scope, id);

    // Only add domain if specified
    const domainProps = (domain && certificate && domainPrefix && hostedZone) ? {
      domain:{
        hostedZone,
        certificate,
        domainNames: [`${domainPrefix}.${domain}`]
      }
    } : {}

    this.nextJSLambdaEdge = new NextJSLambdaEdge(this, "NextJsApp", {
      serverlessBuildOutDir: staticSiteAssetsPath,
      ...domainProps
    });
  }
}
