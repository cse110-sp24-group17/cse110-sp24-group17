export default {
    //Specify the unit test directory and all js file is to be transformed by babel
    testMatch: ["**/__tests__/unit/**/*.test.js"],
    transform: {
      "^.+\\.js$": "babel-jest"
    },
    //use jsdom for unit test environment
    testEnvironment: "jsdom",
    globals: {
      "babel-jest": {
        useESM: true
      }
    },
    coverageDirectory: './coverage/unit',
    collectCoverage: true,
    collectCoverageFrom: ['src/**/*.js'],
  };