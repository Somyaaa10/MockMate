module.exports = {
  testEnvironment: "node",
  testMatch: ["**/tests/**/*.test.js"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.js"],
  verbose: true,
  clearMocks: true,
  resetMocks: false,
  restoreMocks: true,
};
