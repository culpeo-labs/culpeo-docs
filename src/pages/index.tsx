import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs">
            Get Started →
          </Link>
          <Link
            className="button button--outline button--secondary button--lg"
            style={{marginLeft: '1rem'}}
            href="https://github.com/culpeo-labs">
            GitHub
          </Link>
        </div>
      </div>
    </header>
  );
}

type ProjectItem = {
  title: string;
  description: string;
  link: string;
  linkLabel: string;
};

const projects: ProjectItem[] = [
  {
    title: 'CulpeoStream',
    description:
      'A lightweight, bidirectional streaming protocol for real-time AI media applications. Supports audio, video, and text streams in a single persistent connection with session resumption.',
    link: '/docs/culpeostream/intro',
    linkLabel: 'Explore CulpeoStream →',
  },
  {
    title: 'async-ws',
    description:
      'A promise-based, async-iterable WebSocket client that works in browsers and Node.js. Replaces event-listener soup with structured async iteration.',
    link: 'https://github.com/culpeo-labs/async-ws',
    linkLabel: 'View on GitHub →',
  },
];

function Project({title, description, link, linkLabel}: ProjectItem) {
  return (
    <div className={clsx('col col--6')}>
      <div className="card margin--md padding--lg">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
        <Link to={link}>{linkLabel}</Link>
      </div>
    </div>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={siteConfig.title}
      description="Open protocols and libraries for real-time AI applications">
      <HomepageHeader />
      <main>
        <section style={{padding: '3rem 0'}}>
          <div className="container">
            <div className="row">
              {projects.map((props, idx) => (
                <Project key={idx} {...props} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}
