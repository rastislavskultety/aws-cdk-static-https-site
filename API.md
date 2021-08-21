# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### StaticWebSite <a name="aws-cdk-static-https-site.StaticWebSite"></a>

Construct to create static web site with TLS certificate.

The web site is hosted using AWS S3 bucket and CloudFront distribution.

#### Initializer <a name="aws-cdk-static-https-site.StaticWebSite.Initializer"></a>

```typescript
import { StaticWebSite } from 'aws-cdk-static-https-site'

new StaticWebSite(scope: Construct, id: string, props: StaticWebSiteProps)
```

##### `scope`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSite.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

Scope where the site is created, e.g. stack.

---

##### `id`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSite.parameter.id"></a>

- *Type:* `string`

Construct id.

---

##### `props`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSite.parameter.props"></a>

- *Type:* [`aws-cdk-static-https-site.StaticWebSiteProps`](#aws-cdk-static-https-site.StaticWebSiteProps)

Properties.

---



#### Properties <a name="Properties"></a>

##### `bucket`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSite.property.bucket"></a>

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

Reference to S3 bucket holding the static web site.

---

##### `distribution`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSite.property.distribution"></a>

- *Type:* [`@aws-cdk/aws-cloudfront.CloudFrontWebDistribution`](#@aws-cdk/aws-cloudfront.CloudFrontWebDistribution)

Reference to CloudFront distribution.

---

##### `distributionDomain`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSite.property.distributionDomain"></a>

- *Type:* `string`

Domain name of the CloudFront distribution (e.g. abc123defghij.cloudfront.net). When not using the Route 53 hosted zone, this domain can be set as CNAME for the domain to redirect to the distribution.

---

##### `siteDomain`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSite.property.siteDomain"></a>

- *Type:* `string`

Domain name of the site (eg.

www.example.org or example.org)

---

##### `certificate`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSite.property.certificate"></a>

- *Type:* [`@aws-cdk/aws-certificatemanager.Certificate`](#@aws-cdk/aws-certificatemanager.Certificate)

Reference to created certificate.

---

##### `hostedZone`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSite.property.hostedZone"></a>

- *Type:* [`@aws-cdk/aws-route53.IHostedZone`](#@aws-cdk/aws-route53.IHostedZone)

Reference to hosted zone.

---

##### `redirectedDomain`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSite.property.redirectedDomain"></a>

- *Type:* `string`

Domain name of the redirected secondary domain (e.g. example.org). Depends on property primaryDomain. It is undefined if property redirectSecondaryDomain is false.

---

##### `redirectionBucket`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSite.property.redirectionBucket"></a>

- *Type:* [`@aws-cdk/aws-s3.Bucket`](#@aws-cdk/aws-s3.Bucket)

Reference to S3 bucket created for redirection of secondary domain.

---

##### `redirectionDistribution`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSite.property.redirectionDistribution"></a>

- *Type:* [`@aws-cdk/aws-cloudfront.CloudFrontWebDistribution`](#@aws-cdk/aws-cloudfront.CloudFrontWebDistribution)

Reference to CloudFront distribution created for redirection of secondary domain.

---

##### `redirectionDistributionDomain`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSite.property.redirectionDistributionDomain"></a>

- *Type:* `string`

Domain name of the CloudFront distribution (e.g. abc123defghij.cloudfront.net) created to redirect secondary domain to primary domain.

---


## Structs <a name="Structs"></a>

### StaticWebSiteProps <a name="aws-cdk-static-https-site.StaticWebSiteProps"></a>

Properties of static web site.

#### Initializer <a name="[object Object].Initializer"></a>

```typescript
import { StaticWebSiteProps } from 'aws-cdk-static-https-site'

const staticWebSiteProps: StaticWebSiteProps = { ... }
```

##### `analyticsReporting`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.analyticsReporting"></a>

- *Type:* `boolean`
- *Default:* `analyticsReporting` setting of containing `App`, or value of
'aws:cdk:version-reporting' context key

Include runtime versioning information in this Stack.

---

##### `description`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.description"></a>

- *Type:* `string`
- *Default:* No description.

A description of the stack.

---

##### `env`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.env"></a>

- *Type:* [`@aws-cdk/core.Environment`](#@aws-cdk/core.Environment)
- *Default:* The environment of the containing `Stage` if available,
otherwise create the stack will be environment-agnostic.

The AWS environment (account/region) where this stack will be deployed.

Set the `region`/`account` fields of `env` to either a concrete value to
select the indicated environment (recommended for production stacks), or to
the values of environment variables
`CDK_DEFAULT_REGION`/`CDK_DEFAULT_ACCOUNT` to let the target environment
depend on the AWS credentials/configuration that the CDK CLI is executed
under (recommended for development stacks).

If the `Stack` is instantiated inside a `Stage`, any undefined
`region`/`account` fields from `env` will default to the same field on the
encompassing `Stage`, if configured there.

If either `region` or `account` are not set nor inherited from `Stage`, the
Stack will be considered "*environment-agnostic*"". Environment-agnostic
stacks can be deployed to any environment but may not be able to take
advantage of all features of the CDK. For example, they will not be able to
use environmental context lookups such as `ec2.Vpc.fromLookup` and will not
automatically translate Service Principals to the right format based on the
environment's AWS partition, and other such enhancements.

---

##### `stackName`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.stackName"></a>

- *Type:* `string`
- *Default:* Derived from construct path.

Name to deploy the stack with.

---

##### `synthesizer`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.synthesizer"></a>

- *Type:* [`@aws-cdk/core.IStackSynthesizer`](#@aws-cdk/core.IStackSynthesizer)
- *Default:* `DefaultStackSynthesizer` if the `@aws-cdk/core:newStyleStackSynthesis` feature flag
is set, `LegacyStackSynthesizer` otherwise.

Synthesis method to use while deploying this stack.

---

##### `tags`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.tags"></a>

- *Type:* {[ key: string ]: `string`}
- *Default:* {}

Stack tags that will be applied to all the taggable resources and the stack itself.

---

##### `terminationProtection`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.terminationProtection"></a>

- *Type:* `boolean`
- *Default:* false

Whether to enable termination protection for this stack.

---

##### `rootDomain`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.rootDomain"></a>

- *Type:* `string`

Root domain of the web site, e.g. "example.org".

---

##### `siteContentsPath`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.siteContentsPath"></a>

- *Type:* `string`

Local path where are files of the the static web site stored.

---

##### `certificateArn`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.certificateArn"></a>

- *Type:* `string`

ARN of the existing certificate.

Unless using Route 53, it is recommended to create certificate
manually in AWS Console and pass it's ARN in this parameter. If certificateArn is not defined
then the certificate is created and validated depending on certificateValidation parameter.

---

##### `certificateValidation`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.certificateValidation"></a>

- *Type:* [`aws-cdk-static-https-site.StaticWebSiteCertificateValidation`](#aws-cdk-static-https-site.StaticWebSiteCertificateValidation)
- *Default:* StaticWebSiteCertificateValidation.FROM_EMAIL

Choose validation type for creating new certificate.

It is not used when using Route 53 (useRoute53 is true).

---

##### `createWildcardCertificate`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.createWildcardCertificate"></a>

- *Type:* `boolean`
- *Default:* false

Create wildcard certificate for the sub-domain, e.g. *.example.org.

---

##### `primaryDomain`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.primaryDomain"></a>

- *Type:* [`aws-cdk-static-https-site.StaticWebSitePrimaryDomain`](#aws-cdk-static-https-site.StaticWebSitePrimaryDomain)
- *Default:* StaticWebSitePrimaryDomain.SUB_DOMAIN.

Which domain is the primary domain for the web site - the root domain (e.g. example.org) or the sub domain (e.g. www.example.org).

---

##### `redirectSecondaryDomain`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.redirectSecondaryDomain"></a>

- *Type:* `boolean`
- *Default:* false

Redirect secondary domain to the primary domain.

---

##### `siteSubDomain`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.siteSubDomain"></a>

- *Type:* `string`

Sub domain of the web site e.g. "www".

---

##### `useRoute53`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.useRoute53"></a>

- *Type:* `boolean`
- *Default:* true

Use Route 53 hosted zone.

---

##### `websiteErrorDocument`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.websiteErrorDocument"></a>

- *Type:* `string`
- *Default:* : undefined

File name of the error 404 document of the web site.

---

##### `websiteIndexDocument`<sup>Optional</sup> <a name="aws-cdk-static-https-site.StaticWebSiteProps.property.websiteIndexDocument"></a>

- *Type:* `string`
- *Default:* : 'index.html'

File name of the main index document of the web site.

---



## Enums <a name="Enums"></a>

### StaticWebSiteCertificateValidation <a name="StaticWebSiteCertificateValidation"></a>

Type of certificate validation (not used if using Route 53) If hosted zone is not available then a certificate can be created using DNS or EMAIL validation.

#### `FROM_DNS` <a name="aws-cdk-static-https-site.StaticWebSiteCertificateValidation.FROM_DNS"></a>

---


#### `FROM_EMAIL` <a name="aws-cdk-static-https-site.StaticWebSiteCertificateValidation.FROM_EMAIL"></a>

---


### StaticWebSitePrimaryDomain <a name="StaticWebSitePrimaryDomain"></a>

Specification which of root domain / sub domain is primarilly used to host the static web site.

The other domain can be optionally redirected to the primary domain.

#### `ROOT_DOMAIN` <a name="aws-cdk-static-https-site.StaticWebSitePrimaryDomain.ROOT_DOMAIN"></a>

---


#### `SUB_DOMAIN` <a name="aws-cdk-static-https-site.StaticWebSitePrimaryDomain.SUB_DOMAIN"></a>

---

