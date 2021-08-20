# Package aws-cdk-static-https-site

This is aws-cdk library to create a static website hosted on S3 bucket and CloudFront with https access.
The web site files are copied on AWS S3 bucket and the web site is hosted using CloudFront distribution
which allows to use https secure protocol.

This package supports following features:

- Setup static web site accessible using a root domain (e.g. `example.org`) or a sub-domain (e.g. `www.example.org`).
- Redirect secondary domain to the main domain (e.g. `example.org` => `www.example.org` or `www.example.org` => `example.org`).
- Create TLS certificate to support https or use existing certificate created by AWS Certificate Manager.
s

## Installation:

```
npm install aws-cdk-static-https-site --save

or

yarn add aws-cdk-static-https-site
```

## Basic usage:

```js
import { App, Stack } from '@aws-cdk/core';
import { StaticWebPage } from 'aws-cdk-static-https-site';

const app = new App()

const stack = new Stack(app, 'my-stack', {
  // env is necessary when using Route 53 hosted zone
  env: {
    account: '123456789012', // Your AWS account number
    region: 'us-east-1', // AWS Region
  }
});

// Create web site https://www.example.org with index.html as main document
new StaticWebPage(stack, 'Site', {
  rootDomain: 'example.org';
  siteSubDomain: 'www';
  siteContentsPath: './website'; // Path to local folder with the web site files
});

app.synth();
```

For detailed documentation see [API documentation](API.md).


# Advanced examples

## Custom main html file or error html file

By default the document `index.html` is used as main html document when browsing the web site.

You can setup an other document as the main html file and also a custom document for not found
web pages (http error code 404).


```js
import { StaticWebPage } from 'aws-cdk-static-https-site';

new StaticWebPage(stack, 'Site', {
  rootDomain: 'example.org',
  siteSubDomain: 'www';
  siteContentsPath: './website',
  websiteIndexDocument: 'main.html', // main html document
  websiteErrorDocument: '404.html', // document for http error 404 (not found)
});
```

## Setup web site on the root domain.

Because of DNS limitations the root domain can be used only when using Route 53 hosted zone.

```js
import { StaticWebPage, StaticWebSitePrimaryDomain } from 'aws-cdk-static-https-site';

new StaticWebPage(stack, 'Site', {
  rootDomain: 'example.org',
  siteContentsPath: './website',
  primaryDomain: StaticWebSitePrimaryDomain.ROOT_DOMAIN
});
```


## Setup web site with redirection

Because of DNS limitations this can be done only when using Route 53 hosted zone.

Following code creates web site https://www.example.org and redirect https://example.org
to the web site url:

```js
import { StaticWebPage, StaticWebSitePrimaryDomain } from 'aws-cdk-static-https-site';

new StaticWebPage(stack, 'Site', {
  rootDomain: 'example.org',
  siteSubDomain: 'www',
  siteContentsPath: './website',
  redirectPrimaryDomain: true,
  primaryDomain: StaticWebSitePrimaryDomain.SUB_DOMAIN, // This is the default so it can be omitted
});
```

Following code creates web site https://example.org and redirect https://www.example.org
to the web site url:

```js
import { StaticWebPage, StaticWebSitePrimaryDomain } from 'aws-cdk-static-https-site';

new StaticWebPage(stack, 'Site', {
  rootDomain: 'example.org',
  siteSubDomain: 'www',
  siteContentsPath: './website',
  redirectPrimaryDomain: true,
  primaryDomain: StaticWebSitePrimaryDomain.ROOT_DOMAIN,
});
```


## Setup web site with manually created certificate and DNS records

When the hosted zone is not available then this is the preferred method to create the site.
First log in to the AWS Certificate Manager,and create a certificate for your zone using
a validation of your choice. Then copy the ARN of your certificate to the code example below.

```js
import { StaticWebPage, StaticWebSiteCertificateValidation } from 'aws-cdk-static-https-site';

new StaticWebPage(stack, 'Site', {
  rootDomain: 'example.org',
  siteSubDomain: 'www',
  siteContentsPath: './website',
  useRoute53: false,
  certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/1794af82-40a6-496b-978f-c2b37c25d166', // Your certificate ARN
});
```


## Setup web site without Route 53 hosted zone

Following code creates static web site and certificate validated using email method.

```js
import { StaticWebPage, StaticWebSiteCertificateValidation } from 'aws-cdk-static-https-site';

new StaticWebPage(stack, 'Site', {
  rootDomain: 'example.org',
  siteSubDomain: 'www',
  siteContentsPath: './website',
  useRoute53: false,
  certificateValidation: StaticWebSiteCertificateValidation.FROM_EMAIL, // This is default, so it can be omitted
});
```


## Create a wildcard certificate

If you prefer to create a wilcard certificate to cover any other domains, you can specifiy createWildcardCertificate
property. The wildcard certificate can be used to any subdomain, e.g. www.example.org, stage.example.org, etc...


```js
import { StaticWebPage } from 'aws-cdk-static-https-site';

new StaticWebPage(stack, 'Site', {
  rootDomain: 'example.org',
  siteSubDomain: 'www',
  siteContentsPath: './website',
  createWildcardCertificate: true,
});
```
