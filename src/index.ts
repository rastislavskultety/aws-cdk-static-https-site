/**
 * Create static web site on AWS insfrastructure with https access
 */

import * as acm from '@aws-cdk/aws-certificatemanager';
import * as cloudfront from '@aws-cdk/aws-cloudfront';
import * as route53 from '@aws-cdk/aws-route53';
import { CloudFrontTarget } from '@aws-cdk/aws-route53-targets';
import * as s3 from '@aws-cdk/aws-s3';
import * as s3deployment from '@aws-cdk/aws-s3-deployment';
import * as cdk from '@aws-cdk/core';
import { makeProps, xor } from './tools';


/**
 * Properties of custom S3 bucket for static web site.
 */
interface StaticWebSiteBucketProps extends s3.BucketProps {
  domain: string; // Domain name, eg. www.example.org or example.org, will be used as bucket name
}


/**
 * Custom S3 bucket for static web site
 */
class StaticWebSiteBucket extends s3.Bucket {
  constructor(scope: cdk.Construct, id: string, props: StaticWebSiteBucketProps) {
    const def = {
      // Default props
      defaults: {
        // Delete S3 objects when destroying bucket
        autoDeleteObjects: true,
        // Destroy S3 bucket when destroying the stack
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      },
      // Override props
      overrides: {
        // The physical bucket name must be the same as the domain name
        bucketName: props.domain,
        // Grant access to the files to public
        publicReadAccess: true,
      },
    };

    // Check props validity, static web site should either have index document or should be redirected to another domain
    if (!xor((props.websiteIndexDocument || props.websiteErrorDocument), props.websiteRedirect)) {
      throw new Error('StaticWebSiteBucket: either websiteIndexDocument+websiteErrorDocument or websiteRedirect property must be specified.');
    }

    super(scope, id, makeProps(props, def));
  }
}


/**
 * Properties for CloudFront distribution
 */
interface StaticWebSiteDistributionProps {
  domain: string;
  certificateArn: string;
  defaultRootObject?: string;
}


/**
 * Custom CloudFront web distribution construct
 */
class StaticWebSiteDistribution extends cloudfront.CloudFrontWebDistribution {
  constructor(scope: cdk.Construct, id: string, bucket: s3.Bucket, props: StaticWebSiteDistributionProps) {
    const distributionProps: cloudfront.CloudFrontWebDistributionProps = {
      // Aliases to accesss the web site distribution
      aliasConfiguration: {
        acmCertRef: props.certificateArn,
        names: [props.domain],
        sslMethod: cloudfront.SSLMethod.SNI,
        securityPolicy: cloudfront.SecurityPolicyProtocol.TLS_V1_1_2016,
      },
      // Set origin to the site bucket
      originConfigs: [
        {
          customOriginSource: {
            domainName: bucket.bucketWebsiteDomainName,
            originProtocolPolicy: cloudfront.OriginProtocolPolicy.HTTP_ONLY,
          },
          behaviors: [{ isDefaultBehavior: true }],
        },
      ],
      defaultRootObject: props.defaultRootObject,
    };
    super(scope, id, distributionProps);
  }
}


/**
 * Specification which of root domain / sub domain is primarilly used to host the static web site.
 * The other domain can be optionally redirected to the primary domain.
 */
export enum StaticWebSitePrimaryDomain {
  ROOT_DOMAIN,
  SUB_DOMAIN,
}


/**
 * Type of certificate validation (not used if using Route 53)
 * If hosted zone is not available then a certificate can be created using DNS or EMAIL validation.
 */
export enum StaticWebSiteCertificateValidation {
  FROM_DNS,
  FROM_EMAIL,
}


/**
 * Properties of static web site
 */
export interface StaticWebSiteProps extends cdk.StackProps {
  /**
   * Local path where are files of the the static web site stored.
   */
  readonly siteContentsPath: string;

  /**
   * Root domain of the web site, e.g. "example.org".
   */
  readonly rootDomain: string;

  /**
   * Sub domain of the web site e.g. "www".
   */
  readonly siteSubDomain?: string;

  /**
   * Which domain is the primary domain for the web site - the root domain (e.g. example.org) or
   * the sub domain (e.g. www.example.org).
   *
   * @default StaticWebSitePrimaryDomain.SUB_DOMAIN.
   */
  readonly primaryDomain?: StaticWebSitePrimaryDomain;

  /**
   * Redirect secondary domain to the primary domain.
   *
   * @default false
   */
  readonly redirectSecondaryDomain?: boolean;

  /**
   * File name of the main index document of the web site.
   *
   * @default: 'index.html'
   */
  readonly websiteIndexDocument?: string;

  /**
   * File name of the error 404 document of the web site.
   *
   * @default: undefined
   */
  readonly websiteErrorDocument?: string;

  /**
   * Use Route 53 hosted zone.
   *
   * @default true
   */
  readonly useRoute53?: boolean;

  /**
   * ARN of the existing certificate. Unless using Route 53, it is recommended to create certificate
   * manually in AWS Console and pass it's ARN in this parameter. If certificateArn is not defined
   * then the certificate is created and validated depending on certificateValidation parameter.
   */
  readonly certificateArn?: string;

  /**
   * Create wildcard certificate for the sub-domain, e.g. *.example.org.
   *
   * @default false
   */
  readonly createWildcardCertificate?: boolean;

  /**
   * Choose validation type for creating new certificate. It is not used when using Route 53 (useRoute53 is true).
   *
   * @default StaticWebSiteCertificateValidation.FROM_EMAIL
   */
  readonly certificateValidation?: StaticWebSiteCertificateValidation;

  /**
   * Defines defaultRootObject of the CloudFront distribution.
   * The object (file name) to return when a viewer requests the root URL (/) instead of a specific object.
   *
   * By default the CloudFront uses index.html, however it is better to leave it empty and let S3 bucket to choose
   * the right root document. Therefore the StaticWebSite is using empty string as defaultRootObject.
   *
   * @default ''
   */
  readonly defaultRootObject?: string;
}


/**
 * Construct to create static web site with TLS certificate.
 *
 * The web site is hosted using AWS S3 bucket and CloudFront distribution.
 */
export class StaticWebSite extends cdk.Construct {

  /**
   * Domain name of the site (eg. www.example.org or example.org)
   */
  public readonly siteDomain: string;

  /**
   * Domain name of the CloudFront distribution (e.g. abc123defghij.cloudfront.net).
   * When not using the Route 53 hosted zone, this domain can be set as CNAME
   * for the domain to redirect to the distribution.
   */
  public readonly distributionDomain: string;

  /**
   * Domain name of the redirected secondary domain (e.g. example.org). Depends on property
   * primaryDomain. It is undefined if property redirectSecondaryDomain is false.
   */
  public readonly redirectedDomain: string | undefined;

  /**
   * Domain name of the CloudFront distribution (e.g. abc123defghij.cloudfront.net) created
   * to redirect secondary domain to primary domain.
   */
  public readonly redirectionDistributionDomain: string | undefined;

  /**
   * Reference to S3 bucket holding the static web site
   */
  public readonly bucket: s3.Bucket;

  /**
   * Reference to CloudFront distribution
   */
  public readonly distribution: cloudfront.CloudFrontWebDistribution;

  /**
   * Reference to S3 bucket created for redirection of secondary domain
   */
  public readonly redirectionBucket: s3.Bucket | undefined;

  /**
   * Reference to CloudFront distribution created for redirection of secondary domain
   */
  public readonly redirectionDistribution: cloudfront.CloudFrontWebDistribution | undefined;

  /**
   * Reference to created certificate
   */
  public readonly certificate: acm.Certificate | undefined;

  /**
   * Reference to hosted zone
   */
  public readonly hostedZone: route53.IHostedZone | undefined;

  /**
   * Create new static web site.
   *
   * @param scope - Scope where the site is created, e.g. stack
   * @param id - Construct id
   * @param props - Properties
   */
  constructor(scope: cdk.Construct, id: string, props: StaticWebSiteProps) {
    super(scope, id);

    // Define default values
    const def = {
      defaults: {
        websiteIndexDocument: 'index.html',
        wildcardCertificate: false,
        useRoute53: true,
        primaryDomain: StaticWebSitePrimaryDomain.SUB_DOMAIN,
        redirectSecondaryDomain: false,
        defaultRootObject: '',
      },
    };

    props = makeProps(props, def);

    /*
     * Check props
     */

    if (!props.rootDomain) throw new Error('StaticWebsite: rootDomain must be specified');

    if (!props.siteContentsPath) throw new Error('StaticWebsite: siteContentsPath must be specified');

    if (!xor(props.certificateArn, props.useRoute53)) {
      throw new Error('StaticWebSite: either certificateArn or userRoute53 must be specified.');
    }

    if (props.createWildcardCertificate && props.primaryDomain !== StaticWebSitePrimaryDomain.SUB_DOMAIN) {
      throw new Error('StaticWebSite: createWildcardCertificate valid only for primaryDomain=SUB_DOMAIN');
    }

    if (!props.siteSubDomain && props.primaryDomain == StaticWebSitePrimaryDomain.SUB_DOMAIN) {
      throw new Error('StaticWebSite: siteSubDomain must be specified if selected as primary domain');
    }

    if (!props.siteSubDomain && props.redirectSecondaryDomain) {
      throw new Error('StaticWebSite: siteSubDomain must be specified if redirectSecondaryDomain=true');
    }

    if (!props.useRoute53) {
      if (props.primaryDomain == StaticWebSitePrimaryDomain.ROOT_DOMAIN) {
        throw new Error('StaticWebSite: root domain cannot be used if not using Route 53 due to DNS limitations');
      }
      if (props.redirectSecondaryDomain) {
        throw new Error('StaticWebSite: redirection of root domain is not possible if not using Route 53 due to DNS limitations');
      }
    }


    /*
     * Setup domain names
     */

    if (props.primaryDomain == StaticWebSitePrimaryDomain.SUB_DOMAIN) {
      this.siteDomain = props.siteSubDomain + '.' + props.rootDomain;
      if (props.redirectSecondaryDomain) {
        this.redirectedDomain = props.rootDomain;
      }
    } else {
      this.siteDomain = props.rootDomain;
      if (props.redirectSecondaryDomain) {
        this.redirectedDomain = props.siteSubDomain + '.' + props.rootDomain;
      }
    }
    new cdk.CfnOutput(this, 'Site Url', { value: 'https://' + this.siteDomain });
    if (this.redirectedDomain) {
      new cdk.CfnOutput(this, 'Redirected Url', { value: 'https://' + this.redirectedDomain });
    }


    /*
     * Get hosted zone
     */

    if (props.useRoute53) {
      this.hostedZone = route53.HostedZone.fromLookup(this, 'Zone', { domainName: props.rootDomain });
    }


    /*
     * Add TLS certificate for the site
     */

    let certificateArn = props.certificateArn;

    if (!certificateArn) {
      this.certificate = new acm.Certificate(this, 'Certificate', {
        domainName: props.createWildcardCertificate ? '*.' + props.rootDomain : this.siteDomain,
        subjectAlternativeNames: props.redirectSecondaryDomain ? [this.redirectedDomain!] : [],
        validation:
          this.hostedZone
            ? acm.CertificateValidation.fromDns(this.hostedZone)
            : (props.certificateValidation === StaticWebSiteCertificateValidation.FROM_DNS
              ? acm.CertificateValidation.fromDns()
              : acm.CertificateValidation.fromEmail()
            ),
      });
      certificateArn = this.certificate.certificateArn;
    }


    /*
     * Content bucket to store the static web pages
     */

    this.bucket = new StaticWebSiteBucket(this, 'Site Bucket', {
      domain: this.siteDomain,
      websiteIndexDocument: props.websiteIndexDocument,
      websiteErrorDocument: props.websiteErrorDocument,
    });


    /*
     * Cloudfront distribution
     */

    this.distribution = new StaticWebSiteDistribution(this, 'Site Distribution', this.bucket, {
      domain: this.siteDomain,
      certificateArn,
      defaultRootObject: props.defaultRootObject,
    });


    /*
     * If not using route53, this address has to be set in domain dns records as CNAME
     */

    if (!this.hostedZone) {
      new cdk.CfnOutput(this, 'Set DNS CNAME to distribution domain', {
        value: this.distribution.distributionDomainName,
      });
    }

    this.distributionDomain = this.distribution.distributionDomainName;
    this.redirectionDistributionDomain = undefined;


    /*
     * Route53 alias record for the CloudFront distribution
     */

    if (this.hostedZone) {
      new route53.ARecord(this, 'Site Alias Record', {
        recordName: this.siteDomain,
        target: route53.RecordTarget.fromAlias(new CloudFrontTarget(this.distribution)),
        zone: this.hostedZone,
      });
    }


    /*
     * Manage redirection of root-domain => sub-domain or sub-domain => root-domain
     */

    if (props.redirectSecondaryDomain) {

      /*
       * Create an empty bucket for the redirected domain and set the bucket redirection
       */

      this.redirectionBucket = new StaticWebSiteBucket(this, 'Redirection Bucket', {
        domain: this.redirectedDomain!,
        autoDeleteObjects: false, // no need to auto delete objects because the bucket will be empty
        websiteRedirect: {
          hostName: this.siteDomain,
          protocol: s3.RedirectProtocol.HTTPS,
        },
      });

      /*
       * Create another distribution which will handle the http/https traffic, and the redirection bucket
       * will redirect it to the primary domain.
       */

      this.redirectionDistribution = new StaticWebSiteDistribution(this, 'Redirection Distribution', this.redirectionBucket, {
        domain: this.redirectedDomain!,
        certificateArn: certificateArn,
        defaultRootObject: props.defaultRootObject,
      });

      this.redirectionDistributionDomain = this.redirectionDistribution.distributionDomainName;

      /*
       * Route53 alias record for the CloudFront hosted distribution.
       */

      if (this.hostedZone) {
        new route53.ARecord(this, 'Redirection Alias Record', {
          recordName: this.redirectedDomain,
          target: route53.RecordTarget.fromAlias(new CloudFrontTarget(this.redirectionDistribution)),
          zone: this.hostedZone,
        });
      }
    }


    /*
     * Deploy site contents to S3 bucket
     */

    new s3deployment.BucketDeployment(this, 'Deploy With Invalidation', {
      sources: [s3deployment.Source.asset(props.siteContentsPath)],
      destinationBucket: this.bucket,
      distribution: this.distribution,
      distributionPaths: ['/*'],
    });
  }
}
