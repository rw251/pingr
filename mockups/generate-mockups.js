// too many promise listeners so need to up to this to avoid error
require('events').EventEmitter.defaultMaxListeners = 20;

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

const viewPorts = [
  { desc: 'small laptop', dimensions: { width: 1024, height: 638 } },
  { desc: 'medium laptop #1', dimensions: { width: 1280, height: 670 } },
  { desc: 'medium laptop #2', dimensions: { width: 1366, height: 638 } },
  { desc: 'widescreen', dimensions: { width: 1920, height: 950 } },
];

const views = [
  { desc: 'overview', url: 'http://localhost:3883/#overview', els: ['#team-suggested-actions-table', '#outcomeIndicators'] },
  { desc: 'overview - process indicators', url: 'http://localhost:3883/#overview', click: 'a[href="#processIndicators"]', els: ['#team-suggested-actions-table', '#processIndicators'] },
  { desc: 'indicator - default', url: 'http://localhost:3883/#indicators', els: ['#team-suggested-actions-table', '#patient-list_wrapper'] },
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
  await page.setViewport(viewport.dimensions);
  await page.goto('http://localhost:3883/');
  await page.screenshot({ path: path.join(__dirname, viewport.desc, 'login.png') });
  await page.close();
  await browser.close();
};

const doPageAfterLogin = async (view, viewport) => {
  const browser = await puppeteer.launch(/* { headless: false } */);
  const page = await browser.newPage();
  await page.setViewport(viewport.dimensions);
  await page.goto(view.url);

  if (await page.$('#inpEmail') !== null) {
    // need to login
    await page.type('#inpEmail', 'test@email.com');
    await page.type('input[name="password"]', 'password');

    // click and wait for certain elements to become visible
    await page.bringToFront();
    await page.click('button[type="submit"]');
  }

  // if click then wait for it then click it
  if (view.click) {
    await page.waitForSelector(view.click, { visible: true });
    await page.click(view.click);
  }

  await Promise.all(view.els.map(el => page.waitForSelector(el, { visible: true })));

  await page.screenshot({ path: path.join(__dirname, viewport.desc, `${view.desc}.png`) });
  await page.close();
  await browser.close();
};

async function run() {
  viewPorts.forEach(async (viewport) => {
    doLoginPage(viewport);
    views.forEach(async (view) => {
      doPageAfterLogin(view, viewport);
    });
  });
}

run();
