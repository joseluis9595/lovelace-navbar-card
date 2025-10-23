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
        'configuration/all-options',
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
      items: ['types/js-template', 'types/custom-actions'],
    },
    {
      type: 'doc',
      id: 'dashboard-adjustements',
      label: 'Dashboard Adjustements',
    },
    {
      type: 'category',
      label: 'Need Help?',
      items: ['getting-help/faq', 'getting-help/contact'],
    },
    {
      type: 'doc',
      label: 'Examples',
      id: 'examples',
    },
    {
      type: 'doc',
      label: 'Support the project',
      id: 'support',
    },
  ],
};

export default sidebars;
