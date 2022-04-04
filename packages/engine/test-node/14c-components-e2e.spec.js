import { test, expect } from '@playwright/test';
import { setupTestEngine } from './test-helpers.js';

test.describe('hydration', async () => {
  test('50: hydrate onClientLoad', async ({ page }) => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/14-components/50-hydration-onClientLoad/docs',
    );
    await engine.start();
    const { port } = engine.devServer.config;

    await page.goto(`localhost:${port}`);

    const myEl = page.locator('my-el');
    const hydrated1 = await myEl.getAttribute('hydrated');
    expect(hydrated1).toBe(null); // not hydrated

    await page.waitForLoadState('networkidle0');

    const hydrated2 = await myEl.getAttribute('hydrated');
    expect(hydrated2).toBe(''); // boolean attribute is there

    await cleanup();
  });

  test('51: hydrate onClick', async ({ page }) => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/14-components/51-hydration-onClick/docs',
    );
    await engine.start();
    const { port } = engine.devServer.config;

    await page.goto(`localhost:${port}`);

    const myEl = await page.locator('my-el');
    const hydrated1 = await myEl.getAttribute('hydrated');
    expect(hydrated1).toBe(null); // not hydrated

    await myEl.click();
    await page.waitForLoadState('networkidle0');

    const hydrated2 = await myEl.getAttribute('hydrated');
    expect(hydrated2).toBe(''); // boolean attribute is there

    await cleanup();
  });

  test('52: hydrate onVisible', async ({ page }) => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/14-components/52-hydration-onVisible/docs',
    );
    await engine.start();
    const { port } = engine.devServer.config;

    await page.goto(`localhost:${port}`);
    const myEl = await page.locator('my-el');
    const hydrated1 = await myEl.getAttribute('hydrated');
    expect(hydrated1).toBe(null); // not hydrated

    await myEl.scrollIntoViewIfNeeded();
    await page.waitForLoadState('networkidle0');

    const hydrated2 = await myEl.getAttribute('hydrated');
    expect(hydrated2).toBe(''); // boolean attribute is there

    await cleanup();
  });

  test("53: hydrate onMedia('(max-width: 320px)')", async ({ page }) => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/14-components/53-hydration-onMedia/docs',
    );
    await engine.start();
    const { port } = engine.devServer.config;

    await page.setViewportSize({
      width: 640,
      height: 480,
    });
    await page.goto(`localhost:${port}`);
    const myEl = await page.locator('my-el');
    const hydrated1 = await myEl.getAttribute('hydrated');
    expect(hydrated1).toBe(null); // not hydrated

    await page.setViewportSize({
      width: 320,
      height: 480,
    });
    await page.waitForLoadState('networkidle0');

    const hydrated2 = await myEl.getAttribute('hydrated');
    expect(hydrated2).toBe(''); // boolean attribute is there

    await cleanup();
  });

  test("53b: hydrate onMedia('(max-width: 320px)') as initial size", async ({ page }) => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/14-components/53-hydration-onMedia/docs',
    );
    await engine.start();
    const { port } = engine.devServer.config;

    await page.setViewportSize({
      width: 320,
      height: 480,
    });
    await page.goto(`localhost:${port}`);
    const myEl = await page.locator('my-el');
    await page.waitForLoadState('networkidle0');

    const hydrated2 = await myEl.getAttribute('hydrated');
    expect(hydrated2).toBe(''); // boolean attribute is there

    await cleanup();
  });

  test("54: hydrate onMedia('(max-width: 320px)') && onClick", async ({ page }) => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/14-components/54-hydration-onMedia-onClick/docs',
    );
    await engine.start();
    const { port } = engine.devServer.config;

    await page.setViewportSize({
      width: 640,
      height: 480,
    });
    await page.goto(`localhost:${port}`);
    const myEl = await page.locator('my-el');
    await myEl.click();
    await page.waitForLoadState('networkidle0');
    const hydrated1 = await myEl.getAttribute('hydrated');
    expect(hydrated1).toBe(null); // not hydrated

    await page.setViewportSize({
      width: 320,
      height: 480,
    });
    await myEl.click();
    await page.waitForTimeout(100); // TODO: why is this timeout needed?
    await page.waitForLoadState('networkidle0');

    const hydrated2 = await myEl.getAttribute('hydrated');
    expect(hydrated2).toBe(''); // boolean attribute is there

    await cleanup();
  });

  test("55: hydrate onMedia('(min-width: 640px)') || onClick", async ({ page }) => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/14-components/55-hydration-onMedia-or-onClick/docs',
    );
    await engine.start();
    const { port } = engine.devServer.config;

    await page.setViewportSize({
      width: 640,
      height: 480,
    });
    await page.goto(`localhost:${port}`);
    const myEl = await page.locator('my-el');
    const hydrated1 = await myEl.getAttribute('hydrated');
    expect(hydrated1).toBe(null); // not hydrated

    await page.waitForLoadState('networkidle0');

    const hydrated2 = await myEl.getAttribute('hydrated');
    expect(hydrated2).toBe(''); // boolean attribute is there

    // revisit page on "mobile"
    await page.setViewportSize({
      width: 320,
      height: 480,
    });
    await page.reload();
    const myEl2 = await page.locator('my-el');
    const hydrated3 = await myEl2.getAttribute('hydrated');
    expect(hydrated3).toBe(null); // not hydrated

    await myEl.click();
    await page.waitForLoadState('networkidle0');

    const hydrated4 = await myEl2.getAttribute('hydrated');
    expect(hydrated4).toBe(''); // boolean attribute is there

    await cleanup();
  });
});
