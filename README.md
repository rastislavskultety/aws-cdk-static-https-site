# Package aws-cdk-static-website


This is aws-cdk library to create a static website hosted on S3 bucket and CloudFront


Usage:

```js
new StaticWebPage(scope, id, {
  domainName: 'example.org';
  siteSubDomain: 'www';
  siteContentsPath: './website';
  websiteIndexDocument: 'index.html';
  websiteErrorDocument: '404.html';
  certificateArn: 'arn:aws:acm:us-east-1:123456789012:certificate/12345678-1234-1234-1234-123456789012';
})
```
