const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const viewPorts = [
  { desc: 'small laptop', dimensions: { width: 1024, height: 638 } },
  { desc: 'medium laptop #1', dimensions: { width: 1280, height: 670 } },
  { desc: 'medium laptop #2', dimensions: { width: 1366, height: 638 } },
  { desc: 'widescreen', dimensions: { width: 1920, height: 950 } },
];

viewPorts.forEach((viewport) => {
  // create directories if not exists
  if (!fs.existsSync(path.join(__dirname, viewport.desc))) {
    fs.mkdirSync(path.join(__dirname, viewport.desc));
  }
});

const doLoginPage = async (viewport) => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.setViewport(viewport.viewport);
  await page.goto('http://localhost:3883/');
  await page.screenshot({ path: path.join(__dirname, viewport.desc, 'login.png') });
  await page.close();
  await browser.close();
};

async function run() {
  viewPorts.forEach(async (viewport) => {
    doLoginPage(viewport);
  });
}

run();
