import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({
  headless: 'new',
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--font-render-hinting=none',
  ]
});

const page = await browser.newPage();

const htmlPath = path.resolve(__dirname, 'generate-guide-pdf.html');
await page.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0', timeout: 30000 });

// Wait for fonts to load
await page.evaluateHandle('document.fonts.ready');
await new Promise(r => setTimeout(r, 2000));

const outputPath = path.resolve(__dirname, '포장사양서_사용자가이드.pdf');

await page.pdf({
  path: outputPath,
  format: 'A4',
  printBackground: true,
  margin: { top: '0', right: '0', bottom: '0', left: '0' },
  preferCSSPageSize: false,
  displayHeaderFooter: false
});

console.log(`PDF generated: ${outputPath}`);
await browser.close();
