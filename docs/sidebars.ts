import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
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
      items: ['installation', 'quickstart'],
    },
    {
      type: 'category',
      label: 'Configuration',
      items: [
        'configuration/index',
        'configuration/routes',
        'configuration/template',
        'configuration/desktop',
        'configuration/mobile',
        'configuration/haptic',
        'configuration/media-player',
        'configuration/layout',
      ],
    },
    {
      type: 'category',
      label: 'Types',
      items: ['types/custom-actions', 'types/js-template'],
    },
    {
      type: 'doc',
      id: 'contributing',
      label: 'Contributing',
    },
  ],
};

export default sidebars;
