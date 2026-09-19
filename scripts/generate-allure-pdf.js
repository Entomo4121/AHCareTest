const fs = require('fs');
const path = require('path');
const http = require('http');
const { chromium } = require('playwright');

const projectRoot = path.resolve(__dirname, '..');
const reportDir = path.join(projectRoot, 'allure-report');
const reportPath = path.join(reportDir, 'index.html');
const outputPath = path.join(reportDir, 'allure-report.pdf');

if (!fs.existsSync(reportPath)) {
  console.error(`Allure HTML report not found at ${reportPath}`);
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

    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    fs.createReadStream(filePath).pipe(res);
  } catch (error) {
    res.writeHead(500);
    res.end(`Server error: ${error.message}`);
  }
});

server.listen(0, '127.0.0.1', async () => {
  const { port } = server.address();
  const reportUrl = `http://127.0.0.1:${port}/#suites`;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1200 },
  });

  try {
    await page.goto(reportUrl, { waitUntil: 'networkidle', timeout: 60000 });
    await page.waitForFunction(
      () => !document.querySelector('.spinner') && !!document.querySelector('.tree__content'),
      { timeout: 60000 }
    );
    await page.waitForTimeout(1000);

    await page.pdf({
      path: outputPath,
      format: 'A4',
      printBackground: true,
      margin: {
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
        left: '10mm',
      },
      preferCSSPageSize: true,
    });

    console.log(`PDF report generated at ${outputPath}`);
  } catch (error) {
    console.error(`PDF generation failed: ${error.message}`);
    process.exitCode = 1;
  } finally {
    await browser.close();
    server.close();
  }
});
