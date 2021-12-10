import { Stack, StackProps } from 'aws-cdk-lib';
import { DnsValidatedCertificate, ICertificate } from 'aws-cdk-lib/aws-certificatemanager';
import { CloudFrontWebDistribution, IDistribution, IOriginAccessIdentity, LambdaEdgeEventType, OriginAccessIdentity, ViewerCertificate } from 'aws-cdk-lib/aws-cloudfront';
import { EdgeFunction } from 'aws-cdk-lib/aws-cloudfront/lib/experimental';
import { IUserPool, IUserPoolClient, IUserPoolDomain, UserPool } from 'aws-cdk-lib/aws-cognito';
import { Code, Function, IFunction, Runtime } from 'aws-cdk-lib/aws-lambda';
import { ARecord, HostedZone, IAliasRecordTarget, IHostedZone, RecordTarget } from 'aws-cdk-lib/aws-route53';
import { CloudFrontTarget } from 'aws-cdk-lib/aws-route53-targets';
import { Bucket, IBucket } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { writeFileSync } from 'fs';
import * as path from 'path';

const DESTINATION_KEY_PREFIX = "QuizManagerStaticWebsite";
interface QuizStaticSiteCdkStackProps extends StackProps {
  domain: string;
}
export class QuizStaticSiteCdkStack extends Stack {
  public readonly cloudfrontWebDistribution: IDistribution;
  public readonly staticWebsiteBucket: IBucket;
  public readonly hostedZone: IHostedZone;
  public readonly certificate: ICertificate;
  public readonly target: IAliasRecordTarget;
  public readonly originAccessIdentity: IOriginAccessIdentity;
  public readonly userPool: IUserPool;
  public readonly userPoolClient: IUserPoolClient;
  public readonly lambdaAuth: IFunction;
  public readonly userPoolDomain: IUserPoolDomain;

  constructor(scope: Construct, id: string, props: QuizStaticSiteCdkStackProps) {
    super(scope, id, props);

    this.staticWebsiteBucket = new Bucket(this, `${id}.staticWebsiteBucket`,
      { versioned: true }
    )

    this.hostedZone = new HostedZone(this, `${id}`, {
      zoneName: `${props?.domain}`,
    })

    this.certificate = new DnsValidatedCertificate(this, `${id}.DNS.certificate`, {
      domainName: `quiz.${props.domain}`,
      hostedZone: this.hostedZone,
      region: "us-east-1",
    })

    this.originAccessIdentity = new OriginAccessIdentity(this, `${id}.originAccessIdentity`);
    this.staticWebsiteBucket.grantRead(this.originAccessIdentity);

    this.userPool = new UserPool(this, `${id}.userPool`);
    this.userPoolClient = this.userPool.addClient(`${id}.userPoolClient`);
    this.userPoolDomain = this.userPool.addDomain(`${id}.userPoolDomain`, {
      cognitoDomain: {
        domainPrefix: "aggoatch-quiz"
      }
    })

    const lambdaAuth = new EdgeFunction(this, `${id}.lambdaEdgeAuthenticator`, {
      runtime: Runtime.NODEJS_12_X,
      code: Code.fromAsset("QuizLambdaEdgeAuthBuild"),
      handler: "index.handler",
      environment: {
        region: 'us-east-1',
        userPoolId: this.userPool.userPoolId,
        userPoolAppId: this.userPoolClient.userPoolClientId,
        userPoolDomain: this.userPoolDomain.domainName
      }
    });

    this.cloudfrontWebDistribution = new CloudFrontWebDistribution(this, `${id}.cloudfrontWebDistribution`,
      {
        originConfigs: [{
          s3OriginSource: {
            originPath: `/${DESTINATION_KEY_PREFIX}`,
            s3BucketSource: this.staticWebsiteBucket,
            originAccessIdentity: this.originAccessIdentity,

          },
          behaviors: [{
            
            isDefaultBehavior: true,
            lambdaFunctionAssociations: [
              {
                eventType: LambdaEdgeEventType.ORIGIN_REQUEST,
                lambdaFunction: lambdaAuth.currentVersion,
              },
            ],
          }],
          
        }],

        viewerCertificate: ViewerCertificate.fromAcmCertificate(
          this.certificate,
          { aliases: [`quiz.${props.domain}`] }
        ),
      })

    this.target = new CloudFrontTarget(this.cloudfrontWebDistribution);
    new ARecord(this, 'DomainToDistributionRecord', {
      recordName: `quiz.${props.domain}`,
      target: RecordTarget.fromAlias(this.target),
      zone: this.hostedZone,
    });


    new BucketDeployment(this, "DistBucketDeployment", {
      destinationBucket: this.staticWebsiteBucket,
      destinationKeyPrefix: DESTINATION_KEY_PREFIX,
      distribution: this.cloudfrontWebDistribution,
      distributionPaths: ["/*"],
      sources: [
        Source.asset(path.join("../QuizWebsite/out"))
      ],
    })
  }
  

}
