import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      label: 'Introduction',
      id: 'introduction',
    },
    {
      type: 'category',
      label: 'Getting Started',
      link: {
        type: 'doc',
        id: 'getting-started/index',
      },
      items: ['getting-started/installation', 'getting-started/quickstart'],
    },
    {
      type: 'category',
      label: 'Configuration',
      link: {
        type: 'doc',
        id: 'configuration/index',
      },
      items: [
        'configuration/routes',
        'configuration/template',
        'configuration/desktop',
        'configuration/mobile',
        'configuration/haptic',
        'configuration/media-player',
        'configuration/layout',
        'configuration/styles',
      ],
    },
    {
      type: 'category',
      label: 'Types',
      link: {
        type: 'doc',
        id: 'types/index',
      },
      items: ['types/custom-actions', 'types/js-template'],
    },
    {
      type: 'doc',
      label: 'Examples',
      id: 'examples',
    },
    {
      type: 'doc',
      id: 'faq',
      label: 'FAQ',
    },
    {
      type: 'doc',
      id: 'support',
      label: 'Support the project',
    },
  ],
};

export default sidebars;
