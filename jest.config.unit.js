export default {
    //Specify the unit test directory and all js file is to be transformed by babel
    testMatch: ["**/__tests__/unit/**/*.test.js"],
    transform: {
      "^.+\\.js$": "babel-jest"
    },
    //use jsdom for unit test environment
    testEnvironment: "jest-environment-jsdom",
    globals: {
      "babel-jest": {
        useESM: true
      }
    },
  };