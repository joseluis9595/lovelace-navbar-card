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
      items: ['getting-started/installation', 'getting-started/quickstart'],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'configuration/all_options',
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
      items: ['types/custom-actions', 'types/js-template'],
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
