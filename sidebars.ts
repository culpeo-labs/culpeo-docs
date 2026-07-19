import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    'intro',
    {
      type: 'category',
      label: 'async-ws',
      collapsible: true,
      collapsed: false,
      items: ['async-ws/intro', 'async-ws/api-reference'],
    },
  ],
};

export default sidebars;
