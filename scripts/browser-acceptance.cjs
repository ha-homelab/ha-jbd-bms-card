// Real browser rendering of the distributable with synthetic fixtures only.
// The shared CI workflow supplies the isolated, locked Playwright runtime.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { once } = require('node:events');
const { createHash } = require('node:crypto');

async function main() {
  for (const variable of ['CI_PLAYWRIGHT_MODULE', 'CI_BROWSER_ENGINE', 'CI_BROWSER_DIAGNOSTICS', 'CI_BROWSER_EVIDENCE']) {
    assert.ok(process.env[variable], `${variable} is required`);
  }
  const playwright = require(process.env.CI_PLAYWRIGHT_MODULE);
  const engine = process.env.CI_BROWSER_ENGINE;
  const channel = process.env.CI_BROWSER_CHANNEL;
  assert.ok(['chromium', 'firefox', 'webkit'].includes(engine), 'Unsupported browser engine');
  const output = process.env.CI_BROWSER_DIAGNOSTICS;
  const runtime = JSON.parse(fs.readFileSync(path.join(output, 'runtime.json'), 'utf8'));
  const source = fs.readFileSync(path.join(__dirname, '../ha-jbd-bms-card.js'));
  const fixture = fs.readFileSync(path.join(__dirname, '../test/fixtures/browser.html'));
  const sourceSha256 = createHash('sha256').update(source).digest('hex');
  const server = http.createServer((request, response) => {
    response.setHeader('Cache-Control', 'no-store');
    if (request.method === 'GET' && request.url === '/') {
      response.writeHead(200, {'Content-Type':'text/html; charset=utf-8'}); response.end(fixture);
    } else if (request.method === 'GET' && request.url === '/ha-jbd-bms-card.js') {
      response.writeHead(200, {'Content-Type':'text/javascript; charset=utf-8'}); response.end(source);
    } else { response.writeHead(404); response.end(); }
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  const origin = `http://127.0.0.1:${server.address().port}`;
  const errors = [];
  const unexpectedRequests = [];
  const scenarios = [];
  let browser, context, page;
  try {
    browser = await playwright[engine].launch({headless:true, ...(channel ? {channel} : {})});
    assert.equal(browser.browserType().name(), runtime.engine);
    assert.equal(browser.version(), runtime.browserVersion);
    context = await browser.newContext({viewport:{width:1280,height:900}, serviceWorkers:'block'});
    context.setDefaultTimeout(15000);
    await context.tracing.start({screenshots:true, snapshots:true, sources:true});
    await context.route('**/*', route => {
      const request = route.request();
      const url = new URL(request.url());
      if (url.origin === origin && request.method() === 'GET' && ['/', '/ha-jbd-bms-card.js'].includes(url.pathname)) return route.continue();
      unexpectedRequests.push({method:request.method(), url:request.url()});
      return route.abort('blockedbyclient');
    });
    page = await context.newPage();
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => {if (message.type() === 'error') errors.push(message.text());});
    page.on('websocket', socket => unexpectedRequests.push({method:'WebSocket', url:socket.url()}));
    await page.goto(origin, {waitUntil:'load'});
    await page.waitForFunction(() => window.fixture?.ready === true);
    const card = page.locator('ha-jbd-bms-card');
    const packs = card.locator('.battery');
    const first = packs.nth(0);
    const entity = id => card.locator(`[data-entity="${id}"]`);
    const text = async locator => (await locator.textContent()).trim();
    async function checkSideEffects() {
      assert.deepEqual(errors, [], 'No browser or console errors');
      assert.deepEqual(unexpectedRequests, [], 'Only the two local fixture requests are permitted');
      assert.deepEqual(await page.evaluate(() => fixture.commands), [], 'No device service or WebSocket command');
    }
    async function scenario(name, action) {
      await action();
      await checkSideEffects();
      scenarios.push(name);
    }
    async function assertLayout() {
      const result = await card.evaluate(element => {
        const root = element.shadowRoot;
        const bounds = element.getBoundingClientRect();
        const rects = [...root.querySelectorAll('.battery,.cells,.cell,.metrics,.hero')].map(node => {
          const rect = node.getBoundingClientRect();
          return {className:node.className, left:rect.left, right:rect.right, width:rect.width, height:rect.height, clipped:node.scrollWidth > node.clientWidth + 1};
        });
        return {
          pageWidth:document.documentElement.scrollWidth,
          viewport:document.documentElement.clientWidth,
          left:bounds.left, right:bounds.right,
          cells:root.querySelectorAll('.cell').length,
          packs:root.querySelectorAll('.battery').length,
          overflow:rects.filter(rect => rect.left < bounds.left - 1 || rect.right > bounds.right + 1 || rect.width <= 0 || rect.height <= 0 || rect.clipped),
        };
      });
      assert.equal(result.packs, 8);
      assert.equal(result.cells, 32);
      assert.ok(result.pageWidth <= result.viewport + 1, `Unexpected horizontal page overflow: ${JSON.stringify(result)}`);
      assert.ok(result.left >= -1 && result.right <= result.viewport + 1, 'Card fits the viewport');
      assert.deepEqual(result.overflow, [], 'Battery contents stay inside the card');
    }
    for (const width of [1280, 320]) {
      for (const theme of ['light', 'dark']) {
        await scenario(`${width}px ${theme}: eight packs and 32 cells render without overflow`, async () => {
          await page.setViewportSize({width,height:900});
          await page.evaluate(value => document.documentElement.classList.toggle('dark', value === 'dark'), theme);
          await assertLayout();
          assert.equal(await packs.locator('.cell.missing').count(), 0);
          assert.equal(await packs.locator('.ring-label strong').count(), 8);
          await page.screenshot({path:path.join(output, `${theme}-${width}.png`), fullPage:true, animations:'disabled'});
        });
      }
    }
    await scenario('zero SOC, negative current and mixed V/mV cells retain their values', async () => {
      assert.equal(await text(first.locator('.ring-label strong')), '0');
      assert.equal(await text(entity('sensor.fixture_b1_current').locator('strong')), '-2.5');
      assert.equal(await text(entity('sensor.fixture_b1_power').locator('strong')), '-33');
      assert.deepEqual(await first.locator('.cell strong').allTextContents(), ['3.300','3.310','3.320','3.300']);
      assert.equal(await text(first.locator('.spread strong')), '20');
      assert.deepEqual(await first.locator('.minmax b').allTextContents(), ['3.300 V','3.320 V']);
    });
    await scenario('missing and unavailable cells do not become zero or a complete spread', async () => {
      await page.evaluate(() => fixture.update('sensor.fixture_b1_cell_2', 'unavailable'));
      assert.equal(await text(entity('sensor.fixture_b1_cell_2').locator('strong')), '—');
      assert.equal(await first.locator('.cell.missing').count(), 1);
      assert.equal(await text(first.locator('.cell-head span')), '3/4 cells available');
      assert.equal(await text(first.locator('.spread strong')), '—');
      assert.equal(await text(first.locator('.spread-pill')), 'Incomplete cells');
      assert.deepEqual(await first.locator('.minmax b').allTextContents(), ['— V','— V']);
      await page.evaluate(() => fixture.update('sensor.fixture_b1_cell_3', null));
      assert.equal(await first.locator('.cell.missing').count(), 2);
      assert.equal(await text(first.locator('.cell-head span')), '2/4 cells available');
      await entity('sensor.fixture_b1_cell_3').click();
      assert.deepEqual(await page.evaluate(() => fixture.events), [], 'An absent entity has no more-info action');
    });
    await scenario('availability suppresses retained readings and recovers when online', async () => {
      await page.evaluate(() => {fixture.reset(); fixture.update('binary_sensor.fixture_b2_online', 'off');});
      const offline = packs.nth(1);
      assert.match(await offline.getAttribute('class'), /unavailable/);
      assert.equal(await text(offline.locator('.ring-label strong')), '—');
      assert.equal(await offline.locator('.cell.missing').count(), 4);
      assert.equal(await text(offline.locator('.spread strong')), '—');
      assert.equal(await text(offline.locator('.status')), 'Unavailable');
      await page.evaluate(() => fixture.update('binary_sensor.fixture_b2_online', 'on'));
      assert.equal(await offline.locator('.cell.missing').count(), 0);
      assert.equal(await text(offline.locator('.ring-label strong')), '61');
      assert.equal(await text(offline.locator('.status')), 'Entities available');
    });
    await scenario('unknown pack readings stay missing instead of becoming zero', async () => {
      await page.evaluate(() => {
        fixture.reset();
        fixture.update('sensor.fixture_b1_soc', 'unknown');
        fixture.update('sensor.fixture_b1_current', 'unavailable');
        fixture.update('sensor.fixture_b1_voltage', 'NaN');
      });
      assert.equal(await text(first.locator('.ring-label strong')), '—');
      assert.equal(await text(entity('sensor.fixture_b1_current').locator('strong')), '—');
      assert.equal(await text(first.locator('.volts')), '—V');
      assert.equal(await text(first.locator('.status')), 'Partial data');
      assert.equal(await first.locator('.cell.missing').count(), 0);
      assert.equal(await text(first.locator('.spread strong')), '20');
    });
    await scenario('click, Enter and Space open the correct individual entity', async () => {
      await page.evaluate(() => fixture.reset());
      const cell = entity('sensor.fixture_b1_cell_1');
      await cell.click();
      await cell.focus();
      await page.keyboard.press('Enter');
      await page.keyboard.press('Space');
      assert.deepEqual(await page.evaluate(() => fixture.events), Array(3).fill('sensor.fixture_b1_cell_1'));
      assert.equal(await cell.getAttribute('role'), 'button');
      assert.equal(await cell.getAttribute('tabindex'), '0');
    });
    await scenario('relevant readings redraw while preserving keyboard focus and event behavior', async () => {
      const cell = entity('sensor.fixture_b1_cell_1');
      await cell.focus();
      const changed = await page.evaluate(() => {
        const before = fixture.card.shadowRoot.querySelector('ha-card');
        fixture.update('sensor.fixture_b1_cell_1', 3.305, 'V');
        return {redrawn:before !== fixture.card.shadowRoot.querySelector('ha-card'), focused:fixture.card.shadowRoot.activeElement?.dataset.entity};
      });
      assert.deepEqual(changed, {redrawn:true, focused:'sensor.fixture_b1_cell_1'});
      assert.equal(await text(cell.locator('strong')), '3.305');
      await page.keyboard.press('Enter');
      assert.deepEqual(await page.evaluate(() => fixture.events), Array(4).fill('sensor.fixture_b1_cell_1'));
    });
    await scenario('unrelated entity changes preserve rendered nodes and focus', async () => {
      const unchanged = await page.evaluate(() => {
        const before = fixture.card.shadowRoot.querySelector('ha-card');
        const focused = fixture.card.shadowRoot.activeElement;
        fixture.update('light.synthetic_unrelated', 'on');
        return {sameNode:before === fixture.card.shadowRoot.querySelector('ha-card'), sameFocus:focused === fixture.card.shadowRoot.activeElement};
      });
      assert.deepEqual(unchanged, {sameNode:true,sameFocus:true});
    });
    await scenario('HA profile changes and per-card overrides update text without changing entities', async () => {
      await page.evaluate(() => fixture.language('de-DE'));
      assert.equal(await card.getAttribute('lang'), 'de');
      assert.equal(await text(card.locator('h1')), 'Batterieatlas');
      assert.equal(await text(first.locator('h2')), 'Synthetic battery 1');
      assert.equal(await text(entity('sensor.fixture_b1_cell_1').locator('strong')), '3,305');
      await page.evaluate(() => fixture.override('en'));
      assert.equal(await card.getAttribute('lang'), 'en');
      assert.equal(await text(card.locator('h1')), 'Battery atlas');
      await page.evaluate(() => fixture.language('ar'));
      assert.equal(await card.getAttribute('lang'), 'en');
      await page.evaluate(() => fixture.override('auto'));
      assert.equal(await card.getAttribute('lang'), 'ar');
      assert.equal(await card.getAttribute('dir'), 'rtl');
      assert.equal(await text(card.locator('h1')), 'أطلس البطاريات');
      assert.equal(await text(first.locator('h2')), 'Synthetic battery 1');
      assert.equal(await page.evaluate(() => fixture.card.shadowRoot.activeElement?.dataset.entity), 'sensor.fixture_b1_cell_1');
      for (const width of [320, 1280]) {
        await page.setViewportSize({width,height:900});
        await assertLayout();
      }
      assert.equal(await entity('sensor.fixture_b1_current').locator('bdi').getAttribute('dir'), 'ltr');
      await page.screenshot({path:path.join(output, 'arabic-rtl.png'), fullPage:true, animations:'disabled'});
    });
    await checkSideEffects();
    fs.writeFileSync(process.env.CI_BROWSER_EVIDENCE, JSON.stringify({
      ...runtime, engine:browser.browserType().name(), browserVersion:browser.version(),
      sourceSha256, testsPassed:scenarios.length, testsFailed:0, scenarios,
    }, null, 2));
    console.log(`PASS: ${scenarios.length} JBD application scenarios on ${engine} ${browser.version()}`);
  } catch (error) {
    if (page) await page.screenshot({path:path.join(output,'failure.png'), fullPage:true, animations:'disabled'}).catch(() => {});
    fs.writeFileSync(path.join(output, 'failure.json'), JSON.stringify({error:error.message, errors, unexpectedRequests, scenarios}, null, 2));
    throw error;
  } finally {
    if (context) await context.tracing.stop({path:path.join(output,'trace.zip')}).catch(() => {});
    if (browser) await browser.close().catch(() => {});
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
  }
}

main().catch(error => {console.error(error); process.exitCode = 1;});
