module.exports = {
  // Load nodes from the dev-nodes folder
  nodesDir: ['/usr/src/node-red/dev-nodes'],

  // Basic settings
  flowFile: 'flows.json',
  uiPort: process.env.PORT || 1880,

  logging: {
    console: {
      level: 'trace',
      metrics: false,
      audit: false,
    },
  },
};
