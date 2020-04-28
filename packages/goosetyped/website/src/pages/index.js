import React from 'react';
import classnames from 'classnames';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import CodeSnippet from "@site/src/theme/CodeSnippet";
import styles from './styles.module.css';

const nativeCode = `/* customer.ts */
import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  name: String,
  age: Number,
});

export interface ICustomer extends mongoose.Document {
  name: string;
  age: number;
}

export const Customer = mongoose.model<ICustomer>('Customer', customerSchema);`;

const gooseTypedCode = `/* customer.ts */
import { GtDocument, GtModel } from '@pebula/goosetyped';

@GtDocument()
export class Customer extends GtModel() {
  @GtColumn()
  name: string;

  @GtColumn()
  age: number;
}`;

const useCode = `import { Customer } from './customer';

const customer = new Customer({ name: 'John', age: 50 });
`
const features = [
  {
    title: <>Easy to Use</>,
    imageUrl: 'img/undraw_docusaurus_mountain.svg',
    description: (
      <>
        <strong>GooseTyped</strong> is here to make your life easy.
        The classes you define are the actual models you use.
        No intermediate classes or any additional step is required.
      </>
    ),
  },
  {
    title: <>Focus on What Matters</>,
    imageUrl: 'img/undraw_docusaurus_tree.svg',
    description: (
      <>
        Forget about mongoose <strong>Schema</strong>, define your models
        using typescript decorators and let <strong>GooseTyped</strong> do the rest.
        Discriminators? Extending Schemas? who cares... GooseTyped will take care of it for you.
      </>
    ),
  },
  {
    title: <>Code Reuse</>,
    imageUrl: 'img/undraw_docusaurus_react.svg',
    description: (
      <>
        Wether you extend your models using inheritance or composition (via mixins), 
        <strong> GooseTyped</strong> got you covered. Creating models and reusing code is now natural.
      </>
    ),
  },
];

function Feature({imageUrl, title, description}) {
  const imgUrl = useBaseUrl(imageUrl);
  return (
    <div className={classnames('col col--4', styles.feature)}>
      {imgUrl && (
        <div className="text--center">
          <img className={styles.featureImage} src={imgUrl} alt={title} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{description}</p>
    </div>
  );
}

function Home() {
  const context = useDocusaurusContext();
  const {siteConfig = {}} = context;
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Description will go into a meta tag in <head />">
      <header className={classnames('hero hero--primary', styles.heroBanner)}>
        <div className="container">
          <h1 className="hero__title">{siteConfig.title}</h1>
          <p className="hero__subtitle">{siteConfig.tagline}</p>
          <div className={styles.buttons}>
            <Link
              className={classnames(
                'button button--outline button--secondary button--lg',
                styles.getStarted,
              )}
              to={useBaseUrl('docs/getting-started/introduction')}>
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section className={styles.features}>
          <div className="container">
            <div className="row">
              <div className={classnames('col col--6')}>
                <h3>Turn this...</h3>
                <CodeSnippet snippet={nativeCode} lang="typescript"></CodeSnippet>
              </div>  
              <div className={classnames('col col--6')}>
                <h3>To this...</h3>
                <CodeSnippet snippet={gooseTypedCode} lang="typescript"></CodeSnippet>
              </div>  
            </div>
            <div className="row">
              <div className={classnames('col')}>
                <CodeSnippet snippet={useCode} lang="typescript"></CodeSnippet>
                And we're not even scratching the surface of what GooseTyped can do for you...
              </div>
            </div>
          </div>
        </section>
        {features && features.length && (
          <section className={styles.features}>
            <div className="container">
              <div className="row">
                {features.map((props, idx) => (
                  <Feature key={idx} {...props} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>
    </Layout>
  );
}

export default Home;
