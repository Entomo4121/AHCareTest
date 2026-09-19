const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

(async () => {
  const projectRoot = path.resolve(__dirname, '..');
  const reportDir = path.join(projectRoot, 'allure-report');
  const reportPath = path.join(reportDir, 'index.html');
  if (!fs.existsSync(reportPath)) {
    console.error('Missing file', reportPath);
    process.exit(1);
  }

  const server = http.createServer((req, res) => {
    try {
      const requestUrl = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
      let filePath = requestUrl === '/' ? path.join(reportDir, 'index.html') : path.join(reportDir, requestUrl);
      if (!filePath.startsWith(reportDir)) {
        res.writeHead(403);
        return res.end('Forbidden');
      }
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
      if (!fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
        res.writeHead(404);
        return res.end('Not found');
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
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
      fs.createReadStream(filePath).pipe(res);
    } catch (error) {
      res.writeHead(500);
      res.end(`Server error: ${error.message}`);
    }
  });

  server.listen(0, '127.0.0.1', async () => {
    const port = server.address().port;
    const url = `http://127.0.0.1:${port}/`;
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage({ viewport: { width: 1440, height: 1200 } });
    page.on('console', msg => console.log('PAGE:', msg.text()));
    page.on('pageerror', err => console.error('PAGE ERROR:', err.message));
    page.on('requestfailed', req => console.log('REQUEST FAILED', req.url(), req.failure()?.errorText));
    page.on('response', res => { if (res.status() >= 400) console.log('BAD RESPONSE', res.status(), res.url()); });

    try {
      console.log('GOING TO', url);
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      await page.waitForTimeout(8000);
      const htmlLength = await page.evaluate(() => document.documentElement.outerHTML.length);
      const spinner = await page.evaluate(() => !!document.querySelector('.spinner'));
      const tree = await page.evaluate(() => !!document.querySelector('.tree__content'));
      const contentText = await page.evaluate(() => document.querySelector('#content')?.textContent?.trim().slice(0,200));
      const count = await page.evaluate(() => document.querySelectorAll('*').length);
      const bodyText = await page.evaluate(() => document.body.innerText.slice(0,1000));
      console.log('HTML LENGTH', htmlLength);
      console.log('SPINNER PRESENT', spinner);
      console.log('TREE PRESENT', tree);
      console.log('CONTENT TEXT', contentText);
      console.log('ELEMENT COUNT', count);
      console.log('BODY TEXT START', bodyText.replace(/\n/g, '\\n'));
      const dataReady = await page.evaluate(() => ({
        reportDataReady: window.reportDataReady,
        allureCoreLoaded: !!window.__allureCoreLoaded,
        hasTree: !!document.querySelector('.tree__content') || !!document.querySelector('.tree .tree__content'),
        hasSummary: !!document.querySelector('.widget__table') || !!document.querySelector('.widgets'),
      }));
      console.log('STATE', JSON.stringify(dataReady, null, 2));
    } catch (error) {
      console.error('ERROR', error.message);
    } finally {
      await browser.close();
      server.close();
    }
  });
})();
