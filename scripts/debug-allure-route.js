const { chromium } = require('playwright');
const http = require('http');
const fs = require('fs');
const path = require('path');

const reportDir = path.join(__dirname, '..', 'allure-report');
const reportPath = path.join(reportDir, 'index.html');

if (!fs.existsSync(reportPath)) {
  console.error('Allure report index.html not found:', reportPath);
  process.exit(1);
}

const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
};

const server = http.createServer((req, res) => {
  const requestUrl = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  let filePath = requestUrl === '/' ? reportPath : path.join(reportDir, requestUrl);
  if (!filePath.startsWith(reportDir)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  if (!fs.existsSync(filePath)) {
    res.writeHead(404);
    return res.end('Not found');
  }
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(0, '127.0.0.1', async () => {
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });

  page.on('console', msg => console.log('PAGE CONSOLE:', msg.text()));
  page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
  page.on('requestfailed', req => console.log('REQUEST FAILED:', req.url(), req.failure()?.errorText));
  page.on('response', res => { if (res.status() >= 400) console.log('BAD RESPONSE:', res.status(), res.url()); });

  try {
    const url = `http://127.0.0.1:${port}/#suites`;
    console.log('Navigating to', url);
    await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForTimeout(5000);

    const hash = await page.evaluate(() => location.hash);
    const title = await page.title();
    const hrefs = await page.evaluate(() => [...document.querySelectorAll('a')].map(a => a.href).slice(0, 50));
    const buttonTexts = await page.evaluate(() => [...document.querySelectorAll('button, a')].map(el => el.textContent.trim()).filter(Boolean).slice(0, 50));
    const treeExists = await page.evaluate(() => !!document.querySelector('.tree__content'));
    const widgetsExist = await page.evaluate(() => !!document.querySelector('.widget__table') || !!document.querySelector('.widgets'));
    const contentText = await page.evaluate(() => document.querySelector('#content')?.textContent?.trim().slice(0, 400));

    console.log('location.hash', hash);
    console.log('title', title);
    console.log('treeExists', treeExists);
    console.log('widgetsExist', widgetsExist);
    console.log('contentText', contentText);
    console.log('hrefs', JSON.stringify(hrefs, null, 2));
    console.log('buttonTexts', JSON.stringify(buttonTexts, null, 2));
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await browser.close();
    server.close();
  }
});
