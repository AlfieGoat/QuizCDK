import {
  DnsValidatedCertificate,
  ICertificate,
} from "@aws-cdk/aws-certificatemanager";
import {
  ARecord,
  HostedZone,
  IHostedZone,
  RecordTarget,
} from "@aws-cdk/aws-route53";
import { Construct } from "@aws-cdk/core";

interface HostedZoneConstructProps {
  domain: string;
  certificatePrefixes: string[];
  region?: string;
}

export class HostedZoneConstruct extends Construct {
  public readonly certificates: { [k: string]: ICertificate };
  public readonly hostedZone: IHostedZone;
  public readonly records: ARecord[] = [];
  public readonly domain: string;

  constructor(
    scope: Construct,
    id: string,
    { certificatePrefixes, domain, region }: HostedZoneConstructProps
  ) {
    super(scope, id);

    this.domain = domain;

    this.hostedZone = new HostedZone(this, `${id}`, {
      zoneName: `${domain}`,
    });

    this.certificates = Object.fromEntries(
      certificatePrefixes.map((prefix) => [
        prefix,
        new DnsValidatedCertificate(this, `${id}.${prefix}.DNS.certificate`, {
          domainName: `${prefix}.${domain}`,
          hostedZone: this.hostedZone,
          region: region ?? "us-east-1",
        }),
      ])
    );
  }

  public addARecord(target: RecordTarget, id: string, domainPrefix: string) {
    this.records.push(
      new ARecord(this, id, {
        zone: this.hostedZone,
        recordName: `${domainPrefix}.${this.domain}`,
        target,
      })
    );
  }
}
