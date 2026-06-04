import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

const config: Config = {
  title: 'culpeo-labs',
  tagline: 'Open protocols and libraries for real-time AI applications',
  favicon: 'img/favicon.ico',

  future: {
    v4: true,
  },

  url: 'https://culpeo-labs.github.io',
  baseUrl: '/',

  organizationName: 'culpeo-labs',
  projectName: 'culpeo-docs',

  onBrokenLinks: 'throw',

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl: 'https://github.com/culpeo-labs/culpeo-docs/tree/main/',
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
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
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Docs',
        },
        {
          href: 'https://github.com/culpeo-labs',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'CulpeoStream',
          items: [
            {label: 'Overview', to: '/docs/culpeostream/intro'},
            {label: 'Protocol Spec', to: '/docs/culpeostream/spec'},
            {label: 'Security', to: '/docs/culpeostream/security'},
          ],
        },
        {
          title: 'Implementations',
          items: [
            {label: 'TypeScript', to: '/docs/culpeostream/implementations/typescript'},
            {label: 'C#', to: '/docs/culpeostream/implementations/csharp'},
            {label: 'C++', to: '/docs/culpeostream/implementations/cpp'},
          ],
        },
        {
          title: 'Organization',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/culpeo-labs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} culpeo-labs. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['csharp', 'cmake', 'bash'],
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
