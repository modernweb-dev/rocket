import { test, expect } from '@playwright/test';
import { setupTestEngine } from './test-helpers.js';

test('reloads current window on dependency change', async ({ page }) => {
  const { engine, writeSource, anEngineEvent } = await setupTestEngine(
    'fixtures/12-playwright/01-file-change-reloads/docs',
  );
  await writeSource('name.js', "export const name = 'Home';");
  await engine.start();
  const { port } = engine.devServer.config;

  await page.goto(`localhost:${port}`);
  const title = page.locator('h1');
  await expect(title).toHaveText('index');
  const name = page.locator('p');
  await expect(name).toHaveText('Home');

  await writeSource('name.js', "export const name = 'New Home';");
  await anEngineEvent('rocketUpdated');

  await expect(title).toHaveText('index');
  await expect(name).toHaveText('New Home');
});
