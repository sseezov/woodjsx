import { test, expect } from './fixtures.js';

test('route changes clean the old page without removing unmounted components', async ({ page }) => {
  expect(await page.evaluate(async () => {
    const { h, Routes, Route, mountRoute, registry } = core;
    const pending = h('button', { onClick: () => {} }, 'Pending');
    Routes({ mountTo: '#app', children: [
      Route({ path: '/first', component: () => h('button', { onClick: () => {} }, 'First') }),
      Route({ path: '/second', component: () => h('button', { onClick: () => {} }, 'Second') }),
    ] });
    history.replaceState({}, '', '/first');
    await mountRoute();
    history.replaceState({}, '', '/second');
    await mountRoute();
    return document.querySelector('#app').textContent === 'Second' &&
      Object.keys(registry.handlers.onClick).length === 2 &&
      !!registry.handlers.onClick[pending.dataset.onclick];
  })).toBe(true);
});
test('redirect, back and refresh handle dynamic routes and async pages', async ({ page }) => {
  await page.evaluate(async () => {
    const { h, Routes, Route, mountRoute } = core;
    window.visits = 0;
    Routes({ mountTo: '#app', children: [
      Route({ path: '/home', component: () => h('h1', null, 'Home') }),
      Route({ path: '/users/:id', component: async () => {
        await Promise.resolve();
        return h('h1', null, `User ${location.pathname.split('/').pop()}, visit ${++window.visits}`);
      } }),
    ] });
    history.replaceState({}, '', '/home');
    await mountRoute();
  });
  await expect(page.getByRole('heading')).toHaveText('Home');
  await page.evaluate(() => core.redirect('/users/42/'));
  await expect(page.getByRole('heading')).toHaveText('User 42, visit 1');
  await expect(page).toHaveURL(/\/users\/42$/);
  await page.evaluate(() => core.refreshPage());
  await expect(page.getByRole('heading')).toHaveText('User 42, visit 2');
  await page.evaluate(() => core.navigateBack());
  await expect(page.getByRole('heading')).toHaveText('Home');
  await expect(page).toHaveURL(/\/home$/);
});
