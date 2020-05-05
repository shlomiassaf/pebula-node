require('ts-node/register');
const NodeEnvironment = require('jest-environment-node');

class JestServiceBusTestEnvironment extends NodeEnvironment {
  constructor(config) {
    super(config);
    this.sbEnvConfig = config.testEnvironmentOptions || {};
  }

  async setup() {
    await super.setup();
    if (this.sbEnvConfig.envSetup) {
      await require('./env-setup').run();
    }
  }

  async teardown() {
    await super.teardown();
    if (this.sbEnvConfig.envTeardown) {
      await require('./env-teardown').run();
    }
  }

  runScript(script) {
    return super.runScript(script);
  }

  // async handleTestEvent(event, state) {  }
}

module.exports = JestServiceBusTestEnvironment;
