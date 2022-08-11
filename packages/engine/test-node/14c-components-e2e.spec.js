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

  test('50b: hydrate onClientLoad multiple', async ({ page }) => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/14-components/50b-hydration-onClientLoad-multiple/docs',
    );
    await engine.start();
    const { port } = engine.devServer.config;

    const errors = [];
    page.on('pageerror', message => {
      errors.push(message);
    });
    await page.goto(`localhost:${port}`);

    const myEl = page.locator('my-el:first-child');
    const hydrated1 = await myEl.getAttribute('hydrated');
    expect(hydrated1).toBe(null); // not hydrated

    await page.waitForLoadState('networkidle0');

    const hydrated2 = await myEl.getAttribute('hydrated');
    expect(hydrated2).toBe(''); // boolean attribute is there

    // check that no "DOMException: Failed to execute 'define' on 'CustomElementRegistry': the name "my-el" has already been used with this registry" occurred
    expect(errors).toEqual([]);
    await cleanup();
  });

  test('51: hydrate onClick && reDispatches click event', async ({ page }) => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/14-components/51-hydration-onClick/docs',
    );
    await engine.start();
    const { port } = engine.devServer.config;

    await page.goto(`localhost:${port}`);

    const myEl = await page.locator('my-el');
    const hydrated1 = await myEl.getAttribute('hydrated');
    expect(hydrated1).toBe(null); // not hydrated

    // need to manually reach into shadow root as the element is not hydrated
    const shadowButton = await myEl.locator('.shadow-button');
    await shadowButton.click();
    await page.waitForLoadState('networkidle0');

    const hydrated2 = await myEl.getAttribute('hydrated');
    expect(hydrated2).toBe(''); // boolean attribute is there

    const myElClicked = await myEl.getAttribute('clicked');
    expect(myElClicked).toBe(''); // boolean attribute is there

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
    await page.waitForTimeout(150); // TODO: why is this timeout needed?
    await page.waitForLoadState('networkidle0');

    const hydrated2 = await myEl.getAttribute('hydrated');
    expect(hydrated2).toBe(''); // boolean attribute is there

    await cleanup();
  });

  test("55: hydrate onMedia('(min-width: 640px)') || onClick - on desktop", async ({ page }) => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/14-components/55-hydration-onMedia-or-onClick/docs',
    );
    await engine.start();
    const { port } = engine.devServer.config;

    // 1. start on small screen
    await page.setViewportSize({
      width: 320,
      height: 480,
    });
    await page.goto(`localhost:${port}`);
    const myEl = await page.locator('my-el');
    const hydrated1 = await myEl.getAttribute('hydrated');
    expect(hydrated1).toBe(null); // not hydrated

    // 2. go bigger
    await page.setViewportSize({
      width: 640,
      height: 480,
    });
    await page.waitForLoadState('networkidle0');

    const hydrated2 = await myEl.getAttribute('hydrated');
    expect(hydrated2).toBe(''); // boolean attribute is there

    await cleanup();
  });

  test("55b: hydrate onMedia('(min-width: 640px)') || onClick - on mobile", async ({ page }) => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/14-components/55-hydration-onMedia-or-onClick/docs',
    );
    await engine.start();
    const { port } = engine.devServer.config;

    await page.setViewportSize({
      width: 320,
      height: 480,
    });
    await page.goto(`localhost:${port}`);
    const myEl = await page.locator('my-el');

    const hydrated3 = await myEl.getAttribute('hydrated');
    expect(hydrated3).toBe(null); // not hydrated

    await myEl.click();
    await page.waitForLoadState('networkidle0');

    const hydrated4 = await myEl.getAttribute('hydrated');
    expect(hydrated4).toBe(''); // boolean attribute is there

    await cleanup();
  });

  test('56: hydrate onFocus & reDispatch focusin event', async ({ page }) => {
    const { engine, cleanup } = await setupTestEngine(
      'fixtures/14-components/56-hydration-onFocus/docs',
    );
    await engine.start();
    const { port } = engine.devServer.config;

    await page.goto(`localhost:${port}`);

    const myEl = await page.locator('my-el');
    const hydrated1 = await myEl.getAttribute('hydrated');
    expect(hydrated1).toBe(null); // not hydrated

    // need to manually reach into shadow root as the element is not hydrated
    const shadowInput = await myEl.locator('.shadow-input');
    await shadowInput.focus();
    await page.waitForLoadState('networkidle0');

    const hydrated2 = await myEl.getAttribute('hydrated');
    expect(hydrated2).toBe(''); // boolean attribute is there

    const focusInEv = await myEl.getAttribute('focusin-ev');
    expect(focusInEv).toBe('');

    // NOTE: we are using the focusin event as the focus event is NOT supported as it does not bubble
    await cleanup();
  });
});
