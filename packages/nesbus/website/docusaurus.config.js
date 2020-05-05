module.exports = {
  title: 'Service Bus extension for NestJS',
  tagline: 'The tagline of my site',
  url: 'https://shlomiassaf.github.io/pebula-node/nesbus',
  baseUrl: process.env.GH_PAGES_BUILD ? '/pebula-node/nesbus/' : '/',
  favicon: 'img/favicon.ico',
  organizationName: 'pebula',
  projectName: 'nesbus',
  customFields: {
    apiDocsUrl: 'https://shlomiassaf.github.io/pebula-node/nesbus/api-docs',
  },
  themeConfig: {
    navbar: {
      title: '@pebula/nesbus',
      logo: {
        alt: '@pebula/nesbus',
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
          href: 'https://github.com/shlomiassaf/pebula-node/tree/master/packages/nesbus',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        // {
        //   title: 'Docs',
        //   items: [
        //     {
        //       label: 'Style Guide',
        //       to: 'docs/doc1',
        //     },
        //     {
        //       label: 'Second Doc',
        //       to: 'docs/doc2',
        //     },
        //   ],
        // },
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
            // {
            //   label: 'Blog',
            //   to: 'blog',
            // },
            {
              label: 'GitHub',
              href: 'https://github.com/shlomiassaf/pebula-node/tree/master/packages/nesbus',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Shlomi Assaf, Inc. Built with Docusaurus.`,
    },
    googleAnalytics: {
      trackingID: 'UA-11687894-9',
      // Optional fields.
      anonymizeIP: true, // Should IPs be anonymized?
    },
  },
  plugins: [
    '@docusaurus/plugin-google-analytics',
  ],
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl:
            'https://github.com/shlomiassaf/pebula-node/tree/master/packages/nesbus/website/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            'https://github.com/shlomiassaf/pebula-node/tree/master/packages/nesbus/website/blog/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
