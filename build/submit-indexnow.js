'use strict';
/**
 * Submits every URL in sitemap.xml to IndexNow (api.indexnow.org), which fans
 * out the submission to all participating search engines (Bing, Yandex,
 * Seznam.cz, Naver, etc.). Requires the key file <key>.txt to already be
 * live at the site root (see build.js copyAssets whitelist).
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

const ROOT = path.resolve(__dirname, '..');
const HOST = 'www.nice88asia.com';
const KEY = '707b02b55667e9cacad525d404e2382b';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = 'api.indexnow.org';

function getUrlsFromSitemap() {
  const xml = fs.readFileSync(path.join(ROOT, 'sitemap.xml'), 'utf8');
  const matches = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)];
  return matches.map((m) => m[1].trim());
}

function submit(urlList) {
  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList
  });

  const options = {
    hostname: ENDPOINT,
    port: 443,
    path: '/indexnow',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload)
    }
  };

  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => resolve({ statusCode: res.statusCode, body }));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function main() {
  const urls = getUrlsFromSitemap();
  console.log(`Submitting ${urls.length} URLs to IndexNow via https://${ENDPOINT}/indexnow ...`);
  console.log(`Key location: ${KEY_LOCATION}`);
  const result = await submit(urls);
  console.log(`Response status: ${result.statusCode}`);
  if (result.body) console.log(`Response body: ${result.body}`);
  if (result.statusCode >= 200 && result.statusCode < 300) {
    console.log('✓ IndexNow submission accepted.');
  } else {
    console.error('✗ IndexNow submission was not accepted.');
    process.exitCode = 1;
  }
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
