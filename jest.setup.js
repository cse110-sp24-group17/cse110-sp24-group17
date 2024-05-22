const puppeteer = require("puppeteer");

module.exports = async function globalSetup() {
  global.browser = await puppeteer.launch();
};

module.exports = async function globalTeardown() {
  await global.browser.close();
};

