# API Reference <a name="API Reference"></a>

## Constructs <a name="Constructs"></a>

### StaticWebSite <a name="aws-cdk-static-https-site.StaticWebSite"></a>

#### Initializer <a name="aws-cdk-static-https-site.StaticWebSite.Initializer"></a>

```typescript
import { StaticWebSite } from 'aws-cdk-static-https-site'

new StaticWebSite(scope: Construct, id: string, props: IStaticWebSiteProps)
```

##### `scope`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSite.parameter.scope"></a>

- *Type:* [`@aws-cdk/core.Construct`](#@aws-cdk/core.Construct)

---

##### `id`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSite.parameter.id"></a>

- *Type:* `string`

---

##### `props`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSite.parameter.props"></a>

- *Type:* [`aws-cdk-static-https-site.IStaticWebSiteProps`](#aws-cdk-static-https-site.IStaticWebSiteProps)

---



#### Properties <a name="Properties"></a>

##### `distributionDomainName`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSite.property.distributionDomainName"></a>

- *Type:* `string`

---

##### `siteDomain`<sup>Required</sup> <a name="aws-cdk-static-https-site.StaticWebSite.property.siteDomain"></a>

- *Type:* `string`

---




## Protocols <a name="Protocols"></a>

### IStaticWebSiteProps <a name="aws-cdk-static-https-site.IStaticWebSiteProps"></a>

- *Implemented By:* [`aws-cdk-static-https-site.IStaticWebSiteProps`](#aws-cdk-static-https-site.IStaticWebSiteProps)


#### Properties <a name="Properties"></a>

##### `certificateArn`<sup>Required</sup> <a name="aws-cdk-static-https-site.IStaticWebSiteProps.property.certificateArn"></a>

- *Type:* `string`

---

##### `domainName`<sup>Required</sup> <a name="aws-cdk-static-https-site.IStaticWebSiteProps.property.domainName"></a>

- *Type:* `string`

---

##### `siteContentsPath`<sup>Required</sup> <a name="aws-cdk-static-https-site.IStaticWebSiteProps.property.siteContentsPath"></a>

- *Type:* `string`

---

##### `siteSubDomain`<sup>Required</sup> <a name="aws-cdk-static-https-site.IStaticWebSiteProps.property.siteSubDomain"></a>

- *Type:* `string`

---

##### `websiteErrorDocument`<sup>Optional</sup> <a name="aws-cdk-static-https-site.IStaticWebSiteProps.property.websiteErrorDocument"></a>

- *Type:* `string`

---

##### `websiteIndexDocument`<sup>Optional</sup> <a name="aws-cdk-static-https-site.IStaticWebSiteProps.property.websiteIndexDocument"></a>

- *Type:* `string`

---

