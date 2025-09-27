import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';
import { readFileSync } from 'fs';
import { join } from 'path';

// Read version from root package.json
const rootPackageJson = JSON.parse(
  readFileSync(join(__dirname, '..', 'package.json'), 'utf8'),
);
const version = rootPackageJson.version;

const GITHUB_ORG_NAME = 'joseluis9595';
const GITHUB_REPO_NAME = 'lovelace-navbar-card';
const GITHUB_REPO_URL = `https://github.com/${GITHUB_ORG_NAME}/${GITHUB_REPO_NAME}`;
const PAGE_URL = `https://${GITHUB_ORG_NAME}.github.io/${GITHUB_REPO_NAME}`;
const COMMUNITY_FORUM_URL =
  'https://community.home-assistant.io/t/navbar-card-easily-navigate-through-dashboards/832917?u=joseluis9595';

const config: Config = {
  title: 'Navbar Card',
  tagline: 'A customizable navigation bar card for Home Assistant',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: `https://${GITHUB_ORG_NAME}.github.io`,
  baseUrl: `/${GITHUB_REPO_NAME}/`,

  // GitHub pages deployment config
  organizationName: GITHUB_ORG_NAME,
  projectName: GITHUB_REPO_NAME,

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'throw',
  onBrokenAnchors: 'throw',

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
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
          editUrl: `${GITHUB_REPO_URL}/tree/main/docs/`,
        },
        blog: false,
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    navbar: {
      title: 'Navbar Card',
      logo: {
        alt: 'Navbar Card Logo',
        src: 'img/logo_transparent.svg',
        href: '/docs/introduction',
      },
      items: [
        {
          html: `<span>v${version}</span>`,
          position: 'left',
          className: 'navbar-version-chip',
          href: '#',
        },
        {
          href: `${GITHUB_REPO_URL}`,
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      copyright: `Copyright © ${new Date().getFullYear()} Navbar Card. Built with Docusaurus.`,
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  },
};

export default config;
