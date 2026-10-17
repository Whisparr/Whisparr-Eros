// Build: yarn vite build --config frontend/tests/manual-import/vite.config.mts
// Run with NODE_PATH pointing to Playwright. All API calls are intercepted fixtures.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require('playwright');
const output = path.resolve(__dirname, '../../../_output/manual-import-test');
const quality = { quality: { id: 1, name: 'SD', source: 'television', resolution: 480 }, revision: { version: 1, real: 0, isRepack: false } };
const makeItem = id => ({ id, path: `/fixture/file-${id}.mkv`, relativePath: `file-${String(id).padStart(5, '0')}.mkv`,
  folderName: 'fixture', name: `file-${id}`, size: 1024, quality, qualityWeight: 1,
  languages: [{ id: 1, name: 'English' }], movie: { id, title: `Fixture ${id}`, sortTitle: `fixture ${id}` },
  releaseGroup: 'Fixture', customFormats: [], customFormatScore: 0, indexerFlags: 0, rejections: [], movieFileId: id });
const items = Array.from({ length: 10001 }, (_, i) => makeItem(i + 1));
// One invalid, unselected row on the final page.
items[10000].movie = undefined;
items[10000].movieFileId = undefined;

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
    page.setDefaultTimeout(15000);
    const errors = [];
    const writes = [];
    const pageRequests = [];
    const libraryRequests = [];
    const lookupRequests = [];
    let lookupGate = null;
    let pendingImportPaths = new Set();
    const libraryFiles = Array.from({ length: 1001 }, (_, i) => ({
      name: `FixtureSite.26.01.01.Scene${String(i + 1).padStart(4, '0')}.mkv`,
      path: `/library/${i + 1}/same.mkv`, relativePath: `${String(i + 1).padStart(4, '0')}/same.mkv`,
    }));
    const rootSummary = { id: 1, path: '/library', accessible: true, importFileCount: 1001 };

    page.on('pageerror', error => { errors.push(error.message); console.error('PAGE', error.stack); });
    await page.addInitScript(() => { window.Whisparr = { urlBase: '', apiKey: 'fixture', isProduction: true }; });
    await page.route('http://whisparr.test/**', async route => {
      const req = route.request();
      const url = new URL(req.url());
      if (url.pathname.startsWith('/api/')) {
        if (req.method() !== 'GET') {
          writes.push({ path: url.pathname, body: req.postDataJSON() });
          const body = req.postDataJSON();
          if (url.pathname === '/api/v3/movie/import') {
            pendingImportPaths = new Set(body.map(item => item.path));
            return route.fulfill({ json: [] });
          }
          if (url.pathname.includes('/rootFolder/refresh/')) {
            for (let i = libraryFiles.length - 1; i >= 0; i--) {
              if (pendingImportPaths.has(libraryFiles[i].path)) libraryFiles.splice(i, 1);
            }
            pendingImportPaths.clear();
            rootSummary.importFileCount = libraryFiles.length;
            return route.fulfill({ json: rootSummary });
          }
          return route.fulfill({ json: url.pathname.endsWith('/manualimport') ? body.map(item => {
            const result = { ...items[item.id - 1], ...item };
            return result;
          }) : {} });
        }
        assert.notEqual(url.pathname, '/api/v3/manualimport', 'the UI must never request the unpaged list');
        let data = [];
        if (url.pathname === '/api/v3/rootFolder/1') {
          assert.equal(url.searchParams.get('includeImportFiles'), 'false');
          data = rootSummary;
        } else if (url.pathname === '/api/v3/qualityprofile') {
          data = [{ id: 1, name: 'Any', items: [] }];
        } else if (url.pathname === '/api/v3/rootFolder/1/importfiles') {
          const pageNumber = Number(url.searchParams.get('page'));
          const pageSize = Number(url.searchParams.get('pageSize'));
          const source = url.searchParams.get('sortDirection') === 'descending' ? [...libraryFiles].reverse() : libraryFiles;
          data = { page: pageNumber, pageSize, totalRecords: source.length,
            records: source.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) };
          libraryRequests.push({ page: pageNumber, count: data.records.length });
        } else if (url.pathname === '/api/v3/movie/lookup') {
          const term = url.searchParams.get('term');
          lookupRequests.push(term);
          if (lookupGate) await lookupGate;
          const title = term.match(/Scene\d+/)?.[0];
          data = title ? [{ foreignId: title, title, itemType: 'scene', studioTitle: 'Fixture Site', releaseDate: '2026-01-01T00:00:00Z',
            isExisting: false, year: 2026, tmdbId: 0, searchCredits: [] }] : [];
        }

        if (url.pathname.endsWith('/manualimport/paged')) {
          const pageNumber = Number(url.searchParams.get('page'));
          const pageSize = Number(url.searchParams.get('pageSize'));
          const queueItems = ['first', 'second'].map((downloadId, index) => ({ ...makeItem(index + 1), downloadId, movieFileId: undefined }));
          const isQueue = url.searchParams.has('downloadIds');
          if (isQueue) assert.deepEqual(url.searchParams.getAll('downloadIds'), ['first', 'second']);
          const source = [...(isQueue ? queueItems : url.searchParams.get('filterExistingFiles') === 'true' ? items.slice(0, 3) : items)];
          if (url.searchParams.get('sortDirection') === 'descending') source.reverse();
          data = { page: pageNumber, pageSize, totalRecords: source.length,
            records: source.slice((pageNumber - 1) * pageSize, pageNumber * pageSize) };
          pageRequests.push({ page: pageNumber, count: data.records.length });
        }
        return route.fulfill({ json: data });
      }
      if (url.pathname === '/' || url.pathname === '/queue-import' || url.pathname.startsWith('/add/')) {
        return route.fulfill({ contentType: 'text/html', body: fs.readFileSync(path.join(output, 'index.html'), 'utf8').replaceAll('__URL_BASE__', '').replace("urlBase: ''", "urlBase: '', apiRoot: '/api/v3', apiKey: 'fixture', theme: 'light'") });
      }
      const file = path.join(output, url.pathname);
      if (!fs.existsSync(file)) return route.fulfill({ status: 204, body: '' });
      return route.fulfill({ path: file });
    });
    await page.goto('http://whisparr.test/');
    const rows = page.locator('tbody tr');
    try { await rows.first().waitFor(); } catch (e) { console.error((await page.locator('body').innerText()).slice(0, 2000)); throw e; }
    await page.waitForFunction(() => document.body.textContent.includes('Import (50)'));
    assert.equal(await rows.count(), 50);
    assert.match(await page.locator('body').innerText(), /1 \/ 201/);
    assert.deepEqual(pageRequests, [{ page: 1, count: 50 }]);
    const first = page.getByRole('button', { name: 'Go to first page', exact: true });
    const next = page.getByRole('button', { name: 'Go to next page', exact: true });
    const last = page.getByRole('button', { name: 'Go to last page', exact: true });
    const selectRow = (index, options) => rows.nth(index).locator('label').first().click(options);
    const importButton = page.getByRole('button', { name: /^Import \(/ });
    const waitRow = name => page.waitForFunction(name => document.querySelector('tbody tr')?.textContent.includes(name), name);
    await selectRow(0);
    await next.click();
    await waitRow('file-00051');
    await page.waitForFunction(() => document.body.textContent.includes('Import (99)'));
    await selectRow(0, { modifiers: ['Shift'] });
    await first.click();
    await waitRow('file-00001');
    assert.equal(await rows.first().locator('input[type=checkbox]').isChecked(), false);
    await last.click();
    await waitRow('file-10001');
    assert.equal(await rows.count(), 1);
    await selectRow(0);
    assert.equal(await importButton.isDisabled(), true);
    await first.click();
    await waitRow('file-00001');
    assert.equal(await importButton.isDisabled(), true, 'invalid off-page selections still block import');
    assert.equal(await page.getByRole('button', { name: 'Delete', exact: true }).isDisabled(), true);
    await last.click();
    await waitRow('file-10001');
    await selectRow(0);
    await page.getByText('Relative Path', { exact: true }).click();
    await waitRow('file-10001');
    assert.match(await page.locator('body').innerText(), /1 \/ 201/);
    await page.locator('[class*="filterContainer"] button').click();
    await page.getByText('Unmapped Files Only', { exact: true }).click();
    await page.waitForFunction(() => document.querySelectorAll('tbody tr').length === 3);
    await page.waitForFunction(() => document.body.textContent.includes('Import (3)'));
    assert.match(await page.locator('body').innerText(), /1 \/ 1/);
    assert.deepEqual(writes, []);
    await rows.first().getByText('Fixture', { exact: true }).click();
    await page.locator('input[name="releaseGroup"]').fill('EditedFixture');
    await page.getByRole('button', { name: 'Set Release Group', exact: true }).click();
    await waitRow('EditedFixture');
    await page.locator('select[name="importMode"]').selectOption('copy');
    await importButton.click();
    await page.waitForFunction(() => document.title === 'closed');
    const update = writes.find(write => write.path === '/api/v3/moviefile/bulk');
    assert.deepEqual(update.body.map(item => item.id).sort(), [1, 2, 3]);
    assert.equal(update.body.find(item => item.id === 3).releaseGroup, 'EditedFixture');
    assert(pageRequests.every(request => request.count <= 50));
    // Explicitly submit selections from two pages, including an edit made on the hidden page.
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await waitRow('file-00001');
    await page.waitForFunction(() => document.body.textContent.includes('Import (50)'));
    await page.locator('thead label').first().click();
    await selectRow(0);
    await rows.first().getByText('Fixture', { exact: true }).click();
    await page.locator('input[name="releaseGroup"]').fill('CrossPageEdit');
    await page.getByRole('button', { name: 'Set Release Group', exact: true }).click();
    await waitRow('CrossPageEdit');
    await next.click();
    await waitRow('file-00051');
    await page.waitForFunction(() => document.body.textContent.includes('Import (51)'));
    await page.locator('thead label').first().click();
    await selectRow(0);
    await page.locator('select[name="importMode"]').selectOption('copy');
    await importButton.click();
    await page.waitForFunction(() => document.title === 'closed');
    const crossPageUpdate = writes.filter(write => write.path === '/api/v3/moviefile/bulk').at(-1);
    assert.deepEqual(crossPageUpdate.body.map(item => item.id).sort((a, b) => a - b), [1, 51]);
    assert.equal(crossPageUpdate.body.find(item => item.id === 1).releaseGroup, 'CrossPageEdit');
    await page.goto('http://whisparr.test/queue-import');
    await page.waitForFunction(() => document.body.textContent.includes('Import (2)'));
    await importButton.click();
    await page.waitForFunction(() => document.title === 'closed');
    const queueCommand = writes.filter(write => write.path === '/api/v3/command').at(-1);
    assert.deepEqual(queueCommand.body.files.map(file => file.downloadId), ['first', 'second'], 'each queue import file retains its source download');
    let releaseLookup;
    lookupGate = new Promise(resolve => { releaseLookup = resolve; });
    await page.goto('http://whisparr.test/add/import/scenes/1');
    await page.getByRole('button', { name: 'Cancel Processing', exact: true }).click();
    await page.getByRole('button', { name: 'Start Processing', exact: true }).waitFor();
    releaseLookup();
    lookupGate = null;
    await page.getByRole('button', { name: 'Start Processing', exact: true }).click();
    try {
      await page.waitForFunction(() => document.querySelectorAll('[class*="ImportMovieTable-row"]').length === 50);
    } catch (error) {
      console.error('Library page:', (await page.locator('body').innerText()).slice(0, 5000), libraryRequests, lookupRequests.length, errors);
      throw error;
    }
    await page.waitForFunction(() => document.querySelectorAll('[class*="ImportMovieTable-row"] input[type=checkbox]:checked').length === 50);
    assert.deepEqual(libraryRequests, [{ page: 1, count: 50 }]);
    const firstPageLookups = lookupRequests.length;
    assert(firstPageLookups >= 50 && firstPageLookups <= 51);
    await page.locator('[class*="ImportMovieTable-row"]').first().locator('label').click();
    await next.click();
    await page.waitForFunction(() => document.querySelector('[class*="ImportMovieTable-row"]')?.textContent.includes('0051/same.mkv'));
    await page.waitForFunction(() => document.querySelectorAll('[class*="ImportMovieTable-row"] input[type=checkbox]:checked').length === 50);
    assert.equal(lookupRequests.length, firstPageLookups + 50);
    await first.click();
    await page.waitForFunction(() => document.querySelector('[class*="ImportMovieTable-row"]')?.textContent.includes('0001/same.mkv'));
    assert.equal(await page.locator('[class*="ImportMovieTable-row"]').first().locator('input[type=checkbox]').isChecked(), false);
    assert.equal(lookupRequests.length, firstPageLookups + 50, 'cached page lookup results must survive paging');
    await page.screenshot({ path: process.env.WHISPARR_SCREENSHOT || '/private/tmp/whisparr-pagination-pr.png', fullPage: true });
    await last.click();
    await page.waitForFunction(() => document.querySelectorAll('[class*="ImportMovieTable-row"]').length === 1);
    await page.waitForFunction(() => document.querySelectorAll('[class*="ImportMovieTable-row"] input[type=checkbox]:checked').length === 1);
    assert.equal(lookupRequests.length, firstPageLookups + 51, 'unvisited pages must never trigger catalog lookups');
    assert(libraryRequests.every(request => request.count <= 50));
    assert(libraryRequests.some(request => request.page === 21));
    assert.deepEqual(errors, []);
    const batchButton = page.locator('button[class*="ImportMovieFooter-importButton"]');
    const submitted = page.waitForRequest(request => request.url().endsWith('/api/v3/movie/import'));
    await batchButton.click();
    const request = await submitted;
    const batch = request.postDataJSON();
    assert.equal(batch.length, 100, 'submit selections from all three visited pages');
    assert(!batch.some(item => item.path === '/library/1/same.mkv'), 'preserve the first page deselection');
    assert(batch.some(item => item.path === '/library/1001/same.mkv'), 'include records beyond the old cutoff');
    assert.deepEqual(errors, []);
    console.log('PASS: multiple queue downloads preserve per-file source IDs; Cancel/Start Processing controls work.');
    console.log('PASS: library import requests bounded pages, retains cached lookups/deselections, handles duplicate basenames and submits all selected pages.');
    console.log('PASS: 10,001-file manual import, global sorting, page navigation, persistent edits, hidden invalid selections and full submission payload.');
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exit(1); });
