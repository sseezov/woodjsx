import { test, expect } from './fixtures.js';

test('JSX creates components, fragments, attributes, arrays and SVG', async ({ page }) => {
  await page.evaluate(() => fixtures.mountComponents());
  await expect(page.getByRole('heading')).toHaveText('Hello WoodJSX');
  await expect(page.locator('section')).toHaveClass('greeting');
  await expect(page.getByRole('textbox', { name: 'Name' })).toBeEnabled();
  await expect(page.getByRole('textbox', { name: 'Name' })).toHaveAttribute('required');
  await expect(page.locator('p')).toHaveText(['1', '2']);
  await expect(page.locator('p').last()).toHaveAttribute('data-number', '2');
  expect(await page.locator('#app').evaluate(element => element.children.length)).toBe(2);
  expect(await page.locator('circle').evaluate(element => element.namespaceURI))
    .toBe('http://www.w3.org/2000/svg');
});

test('initWood wires events and explicit rendering updates a counter', async ({ page }) => {
  await page.evaluate(() => fixtures.mountCounter());
  await expect(page.locator('#count')).toHaveText('0');
  for (let i = 1; i <= 3; i++) {
    await page.getByRole('button', { name: 'Increment' }).click();
    await expect(page.locator('#count')).toHaveText(String(i));
  }
});
