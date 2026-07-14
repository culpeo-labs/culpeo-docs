import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    'intro',
    {
      type: 'category',
      label: 'CulpeoStream',
      collapsible: false,
      items: [
        'culpeostream/intro',
        'culpeostream/spec',
        'culpeostream/security',
        {
          type: 'category',
          label: 'Implementations',
          items: [
            'culpeostream/implementations/typescript',
            'culpeostream/implementations/csharp',
            'culpeostream/implementations/cpp',
          ],
        },
      ],
    },
    {
      type: 'category',
      label: 'async-ws',
      collapsible: false,
      items: ['async-ws/intro', 'async-ws/api-reference'],
    },
  ],
};

export default sidebars;
