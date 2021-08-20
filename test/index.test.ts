import { SynthUtils } from '@aws-cdk/assert';
import { Stack } from '@aws-cdk/core';
import { StaticWebSiteProps, StaticWebSite, StaticWebSitePrimaryDomain } from '../src';
import '@aws-cdk/assert/jest';

function createStack() {
  return new Stack(undefined, undefined, {
    env: {
      account: 'accountid',
      region: 'us-east-1',
    },
  });
}

const defaultProps = {
  rootDomain: 'example.org',
  siteSubDomain: 'www',
  siteContentsPath: './test/test-website',
  useRoute53: true,
  redirectSecondaryDomain: true,
};

function getProps(customProps?: object): StaticWebSiteProps {
  return Object.assign({}, defaultProps, customProps) as StaticWebSiteProps;
}

function createTestCase(customProps?: object): { stack: Stack; site: StaticWebSite } {
  const stack = createStack();
  const site = new StaticWebSite(stack, 'test', getProps(customProps));
  return { stack, site };
}

test('Refactoring test using snapshot', () => {
  const { stack } = createTestCase();
  expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('All resources are created', () => {
  const { stack } = createTestCase();

  expect(stack).toHaveResourceLike('AWS::S3::Bucket', { BucketName: 'www.example.org' });
  expect(stack).toHaveResourceLike('AWS::S3::Bucket', { BucketName: 'example.org' });
  expect(stack).toHaveResourceLike('AWS::CloudFront::Distribution', {
    DistributionConfig: { Aliases: ['www.example.org'] },
  });
  expect(stack).toHaveResourceLike('AWS::CloudFront::Distribution', {
    DistributionConfig: { Aliases: ['example.org'] },
  });
  expect(stack).toHaveResourceLike('AWS::CertificateManager::Certificate', {
    DomainName: 'www.example.org',
  });
  expect(stack).toHaveResource('AWS::Route53::RecordSet', { Name: 'example.org.', Type: 'A' });
  expect(stack).toHaveResource('AWS::Route53::RecordSet', { Name: 'www.example.org.', Type: 'A' });
});

test('Domain names are correct for primaryDomain=SUB_DOMAIN', () => {
  const { site } = createTestCase({ primaryDomain: StaticWebSitePrimaryDomain.SUB_DOMAIN });

  expect(site.siteDomain).toBe('www.example.org');
  expect(site.redirectedDomain).toBe('example.org');
});

test('Domain names are correct for primaryDomain=ROOT_DOMAIN', () => {
  const { site } = createTestCase({ primaryDomain: StaticWebSitePrimaryDomain.ROOT_DOMAIN });
  expect(site.siteDomain).toBe('example.org');
  expect(site.redirectedDomain).toBe('www.example.org');
});

test('Creating Wildcard certificate', () => {
  const { stack } = createTestCase({ createWildcardCertificate: true });
  expect(stack).toHaveResourceLike('AWS::CertificateManager::Certificate', {
    DomainName: '*.example.org',
  });
});

test('Default index document', () => {
  const { stack } = createTestCase();

  expect(stack).toHaveResource('AWS::S3::Bucket', {
    BucketName: 'www.example.org',
    WebsiteConfiguration: {
      IndexDocument: 'index.html',
    },
  });
});

test('Specific index and error document', () => {
  const { stack } = createTestCase({
    websiteIndexDocument: 'main.html',
    websiteErrorDocument: '404.html',
  });
  expect(stack).toHaveResource('AWS::S3::Bucket', {
    BucketName: 'www.example.org',
    WebsiteConfiguration: {
      ErrorDocument: '404.html',
      IndexDocument: 'main.html',
    },
  });
});

test('Using root domain only for the web site', () => {
  const { stack } = createTestCase({
    siteSubDomain: '',
    primaryDomain: StaticWebSitePrimaryDomain.ROOT_DOMAIN,
    redirectSecondaryDomain: false,
  });
  expect(stack).toHaveResourceLike('AWS::S3::Bucket', { BucketName: 'example.org' });
});

test('Checking invalid properties', () => {
  // Root domain must be always specified.
  expect(() => createTestCase({ rootDomain: null })).toThrowError(/rootDomain must be specified/);

  // Site contents must be always specified.
  expect(() => createTestCase({ siteContentsPath: null })).toThrowError(/siteContentsPath must be specified/);

  // Sub domain must be specified if it is primary
  expect(() => createTestCase({ siteSubDomain: '' })).toThrowError(/siteSubDomain must be specified/);

  // Redirection is not valid if there is no sub domain
  expect(() => createTestCase({
    siteSubDomain: '',
    primaryDomain: StaticWebSitePrimaryDomain.ROOT_DOMAIN,
    redirectSecondaryDomain: true,
  })).toThrowError(/siteSubDomain must be specified/);

  // Cannot use wildcard for certificate if primary domain = ROOT_DOMAIN
  expect(() => createTestCase({
    createWildcardCertificate: true,
    primaryDomain: StaticWebSitePrimaryDomain.ROOT_DOMAIN,
  })).toThrowError(/createWildcardCertificate/);

  // Certificate ARN must be specified if not using Route 53
  expect(() => createTestCase({ useRoute53: false })).toThrowError(/certificateArn or userRoute53/);

  // Cannot use redirection if not using route53
  expect(() => createTestCase({
    useRoute53: false,
    certificateArn: 'some',
    primaryDomain: StaticWebSitePrimaryDomain.ROOT_DOMAIN,
  })).toThrowError(/root domain cannot be used/);

  // Cannot use redirection if not using route53
  expect(() => createTestCase({ useRoute53: false, certificateArn: 'some' })).toThrowError(/redirection .* not possible/);

});
