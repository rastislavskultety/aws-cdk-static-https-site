import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deployment from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';


export interface StaticWebSiteProps extends cdk.StackProps {
  domainName: string;
  siteSubDomain: string;
  siteContentsPath: string;
  websiteIndexDocument?: string;
  websiteErrorDocument?: string;
  certificateArn: string;
}

export class StaticWebSite extends cdk.Construct {

  public siteDomain: string;
  public distributionDomainName: string;

  constructor(scope: cdk.Construct, id: string, props: StaticWebSiteProps) {
    super(scope, id);

    // Domain name e.g. www.example.com
    const siteDomain = props.siteSubDomain + '.' + props.domainName;
    new cdk.CfnOutput(this, 'Site', { value: 'https://' + siteDomain });

    this.siteDomain = siteDomain;

    // Content bucket to store the static web pages
    const siteBucket = new s3.Bucket(this, 'SiteBucket', {
      // The physical bucket name must be the same as the domain name
      bucketName: siteDomain,

      // Grant access to the files to public
      publicReadAccess: true,

      // Delete all objects when destroying stack / bucket
      autoDeleteObjects: true,

      // The default removal policy is RETAIN, which means that cdk destroy will not attempt to delete
      // the new bucket, and it will remain in your account until manually deleted. By setting the policy to
      // DESTROY, cdk destroy will attempt to delete the bucket, but will error if the bucket is not empty.
      removalPolicy: cdk.RemovalPolicy.DESTROY,

      // The main html document (usually index.html)
      websiteIndexDocument: props.websiteIndexDocument || 'index.html',

      // Html document returnt for http error 404
      websiteErrorDocument: props.websiteErrorDocument || 'index.html',

    });
    new cdk.CfnOutput(this, 'Bucket', { value: siteBucket.bucketName });


    // // TLS certificate
    // // If not using Route S3 domain hosting, it is safer to create certificate manually
    // // and pass its ARN in props
    // const certificate = new acm.Certificate(this, 'SiteCertificate', {
    //   domainName: siteDomain,
    //   validation: acm.CertificateValidation.fromDns(), // Records must be added manually
    // });
    // new cdk.CfnOutput(this, "Certificate", { value: certificate.certificateArn });

    const certificateArn = props.certificateArn;

    // CloudFront distribution that provides HTTPS
    const distribution = new cloudfront.CloudFrontWebDistribution(
      this,
      'SiteDistribution',
      {
        aliasConfiguration: {
          acmCertRef: certificateArn,
          names: [siteDomain],
          sslMethod: cloudfront.SSLMethod.SNI,
          securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
        },
        originConfigs: [
          {
            customOriginSource: {
              domainName: siteBucket.bucketWebsiteDomainName,
              originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
      },
    );
    new cdk.CfnOutput(this, 'DistributionId', {
      value: distribution.distributionId,
    });
    // This address has to be set in domain dns records as CNAME
    new cdk.CfnOutput(this, 'DistributionDomainName', {
      value: distribution.distributionDomainName,
    });
    this.distributionDomainName = distribution.distributionDomainName;

    // Deploy site contents to S3 bucket
    new s3deployment.BucketDeployment(this, 'DeployWithInvalidation', {
      sources: [s3deployment.Source.asset(props.siteContentsPath)],
      destinationBucket: siteBucket,
      distribution,
      distributionPaths: ['/*'],
    });
  }
}
