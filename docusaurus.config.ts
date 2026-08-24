import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

const config: Config = {
  title: 'culpeo-labs',
  tagline: 'Notes and projects from learning and experimenting',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://culpeo.ws',
  baseUrl: '/',

  organizationName: 'culpeo-labs',
  projectName: 'culpeo-docs',

  onBrokenLinks: 'throw',

  plugins: [
    [
      'docusaurus-plugin-remote-content',
      {
        name: 'async-ws-docs',
        sourceBaseUrl: 'https://raw.githubusercontent.com/culpeo-labs/async-ws/main/docs/',
        outDir: 'docs/async-ws',
        documents: ['intro.md', 'api-reference.md'],
      },
    ],
  ],

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          routeBasePath: '/',
          sidebarPath: './sidebars.ts',
          editUrl: ({docPath}) => {
            const asyncWsPrefix = 'async-ws/';
            if (docPath.startsWith(asyncWsPrefix)) {
              return `https://github.com/culpeo-labs/async-ws/tree/main/docs/${docPath.slice(asyncWsPrefix.length)}`;
            }
            return `https://github.com/culpeo-labs/culpeo-docs/tree/main/docs/${docPath}`;
          },
        },
        blog: {
          routeBasePath: 'blog',
          showReadingTime: true,
          remarkPlugins: [remarkMath],
          rehypePlugins: [rehypeKatex],
        },
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],
  stylesheets: [
    {
      href: 'https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css',
      type: 'text/css',
      crossorigin: 'anonymous',
    },
  ],

  themeConfig: {
    image: 'img/culpeo-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    navbar: {
      title: 'culpeo-labs',
      logo: {
        alt: 'culpeo-labs logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          to: '/blog',
          label: 'Blog',
          position: 'left',
        },
        {
          href: 'https://github.com/culpeo-labs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'cmake', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
