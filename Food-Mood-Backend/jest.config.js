module.exports = {
    testEnvironment: 'node',  // Use Node.js as the test environment
    // globalSetup: './tests/setup.js',  // Path to the setup file (optional)
    setupFiles: ['./tests/setup.js'],  // Set up the test environment before tests
    collectCoverage: true,  // Optional: collect code coverage for the tests
    verbose: true,          // Optional: display detailed test results
  };
  