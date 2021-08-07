import { SynthUtils } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { StaticWebSite } from '../src';
import '@aws-cdk/assert/jest';


test('StaticWebSite', () => {
  // const app = new App();
  // const stack = new Stack(app, 'test');
  const stack = new Stack();

  const site = new StaticWebSite(stack, 'MyStaticWebSite', {
    domainName: 'example.org',
    siteSubDomain: 'www',
    siteContentsPath: './test/website',
    certificateArn: '...',
    websiteIndexDocument: 'main.html',
    websiteErrorDocument: '404.html',
  });

  expect(site.siteDomain).toBe('www.example.org');
  expect(stack).toHaveResource('AWS::S3::Bucket', {
    BucketName: 'www.example.org',
    WebsiteConfiguration: {
      ErrorDocument: '404.html',
      IndexDocument: 'main.html',
    },
  });
  expect(stack).toHaveResource('AWS::CloudFront::Distribution');
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
