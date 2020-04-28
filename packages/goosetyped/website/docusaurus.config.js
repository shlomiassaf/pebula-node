module.exports = {
  title: 'GooseTyped',
  tagline: 'Real Mongoose models using TypeScript classes',
  url: 'https://shlomiassaf.github.io/pebula-node/goosetyped',
  baseUrl: process.env.GH_PAGES_BUILD ? '/pebula-node/goosetyped/' : '/',
  favicon: 'img/favicon.ico',
  organizationName: 'pebula',
  projectName: 'goosetyped',
  customFields: {
    apiDocsUrl: 'https://shlomiassaf.github.io/pebula-node/goosetyped/api-docs',
    mongooseDocsUrl: 'https://mongoosejs.com/docs',
  },
  themeConfig: {
    navbar: {
      title: '@pebula/goosetyped',
      logo: {
        alt: '@pebula/goosetyped',
        src: 'img/logo.svg',
      },
      links: [
        {
          to: 'docs/getting-started/introduction',
          activeBasePath: 'docs',
          label: 'Docs',
          position: 'left',
        },
        // {to: 'blog', label: 'Blog', position: 'left'},
        {
          href: 'https://shlomiassaf.github.io/pebula-node/goosetyped/api-docs/index.html',
          label: 'API Docs',
          position: 'right',
        },
        {
          href: 'https://github.com/shlomiassaf/pebula-node/tree/master/packages/goosetyped',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Docs',
          items: [
            // { label: 'Style Guide', to: 'docs/doc1' },
            // { label: 'Second Doc', to: 'docs/doc2' },
          ],
        },
        // {
        //   title: 'Community',
        //   items: [
        //     {
        //       label: 'Stack Overflow',
        //       href: 'https://stackoverflow.com/questions/tagged/docusaurus',
        //     },
        //     {
        //       label: 'Discord',
        //       href: 'https://discordapp.com/invite/docusaurus',
        //     },
        //     {
        //       label: 'Twitter',
        //       href: 'https://twitter.com/docusaurus',
        //     },
        //   ],
        // },
        {
          title: 'More',
          items: [
            // { label: 'Blog', to: 'blog' },
            {
              label: 'GitHub',
              href: 'https://github.com/shlomiassaf/pebula-node/tree/master/packages/goosetyped',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/shlomiassaf/pebula-node/tree/master/packages/goosetyped/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/shlomiassaf/pebula-node/tree/master/packages/goosetyped/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
