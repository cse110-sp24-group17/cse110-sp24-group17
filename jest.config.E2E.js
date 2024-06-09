export default {
    //Use puppeteer for E2E only, specify E2E test file directory
    preset: 'jest-puppeteer',
    testMatch: ["**/__tests__/E2E/**/*.test.js"],
    transform: {
      "^.+\\.js$": "babel-jest"
    },
    globals: {
      "babel-jest": {
        useESM: true
      }
    },
  };