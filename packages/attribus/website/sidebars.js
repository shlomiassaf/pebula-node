module.exports = {
  docs: {
    'Getting Started': [
      'getting-started/introduction',
      'getting-started/installation',
      'getting-started/basic-example',
    ],
    Guide: [
      'guide/declaration',
      'guide/configuration',
      'guide/emitters',
      'guide/receivers',
      'guide/the-context',
      'guide/provisioning',
      'guide/interceptors',
    ],
    Tasks: [
      'tasks/introduction',
      'tasks/back-off',
      'tasks/idempotent-subscriber',
    ],
    'NestJS': [
      {
        type: "category",
        label: "Getting Started",
        items: [
          'nestjs/getting-started/introduction',
          'nestjs/getting-started/installation',
          'nestjs/getting-started/basic-example',
        ]
      },
      {
        type: "category",
        label: "Guide",
        items: [
          'nestjs/guide/declaration',
          'nestjs/guide/configuration',
          'nestjs/guide/emitters',
          'nestjs/guide/receivers',
          'nestjs/guide/the-context',
          'nestjs/guide/provisioning',
          'nestjs/guide/interceptors',
        ]
      },
      {
        type: "category",
        label: "Tasks",
        items: [
          'nestjs/tasks/introduction',
          'nestjs/tasks/back-off',
          'nestjs/tasks/idempotent-subscriber',
        ]
      },
      {
        type: "category",
        label: "Recipes",
        items: [
          'nestjs/recipes/dynamic-entity-configuration',
        ]
      }
    ],
  },
};
