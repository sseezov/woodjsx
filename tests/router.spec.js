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

test('package exports register routes that work with public navigation', async ({ page }) => {
  await page.evaluate(() => fixtures.mountRoutesFromPackage());
  await expect(page.getByRole('heading')).toHaveText('Home');
  await page.evaluate(() => core.redirect('/settings'));
  await expect(page.getByRole('heading')).toHaveText('Settings');
  await expect(page).toHaveURL(/\/settings$/);
});

test('wildcard handles unknown URLs but never shadows a regular route', async ({ page }) => {
  await page.evaluate(() => {
    const { Routes, Route } = core;
    Routes({ mountTo: '#app', children: [
      Route({ path: '*', component: () => 'Not found' }),
      Route({ path: '/home', component: () => 'Home' }),
    ] });
    return core.redirect('/home');
  });
  await expect(page.locator('#app')).toHaveText('Home');
  await page.evaluate(() => core.redirect('/missing'));
  await expect(page.locator('#app')).toHaveText('Not found');
  await page.evaluate(() => core.navigateBack());
  await expect(page.locator('#app')).toHaveText('Home');
});

for (const asyncPage of [false, true]) {
  test(`shared error component handles ${asyncPage ? 'async rejection' : 'synchronous throw'} and navigation recovers`, async ({ page }) => {
    await page.evaluate(async (asyncPage) => {
      const { h, Routes, Route, redirect } = core;
      const failure = new Error('Page failed');
      const fail = () => { throw failure; };
      Routes({ mountTo: '#app', errorComponent: async ({ error }) => {
        if (error !== failure) throw new Error('Original error was lost');
        return h('p', { role: 'alert' }, error.message);
      }, children: [
        Route({ path: '/home', component: () => h('button', { onClick: () => {} }, 'Home') }),
        Route({ path: '/broken', component: asyncPage ? async () => fail() : fail }),
      ] });
      await redirect('/home');
      await redirect('/broken');
    }, asyncPage);
    await expect(page.getByRole('alert')).toHaveText('Page failed');
    expect(await page.evaluate(() => Object.keys(core.registry.handlers.onClick).length)).toBe(0);
    await page.evaluate(() => core.refreshPage());
    await expect(page.getByRole('alert')).toHaveText('Page failed');
    await page.evaluate(() => core.redirect('/home'));
    await expect(page.getByRole('button')).toHaveText('Home');
  });
}

test('route error component overrides the shared component, including on wildcard', async ({ page }) => {
  await page.evaluate(() => {
    const { Routes, Route } = core;
    const component = () => { throw new Error('Failed'); };
    Routes({ mountTo: '#app', errorComponent: () => 'Shared error', children: [
      Route({ path: '/broken', component, errorComponent: ({ error }) => `Local: ${error.message}` }),
      Route({ path: '*', component, errorComponent: () => 'Not-found error' }),
    ] });
    return core.redirect('/broken');
  });
  await expect(page.locator('#app')).toHaveText('Local: Failed');
  await page.evaluate(() => core.redirect('/missing'));
  await expect(page.locator('#app')).toHaveText('Not-found error');
});

test('missing handlers and failing error components propagate errors', async ({ page }) => {
  const messages = await page.evaluate(async () => {
    const { Routes, Route, redirect } = core;
    Routes({ mountTo: '#app', children: [
      Route({ path: '/broken', component: () => { throw new Error('Page failed'); } }),
      Route({ path: '/boundary', component: () => { throw new Error('Page failed'); },
        errorComponent: async () => { throw new Error('Error component failed'); } }),
    ] });
    const messages = [];
    for (const path of ['/missing', '/broken', '/boundary']) {
      try { await redirect(path); } catch (error) { messages.push(error.message); }
    }
    return messages;
  });
  expect(messages).toEqual([
    'No route matches "/missing". Add a Route with path="*" for a not-found page.',
    'Page failed',
    'Error component failed',
  ]);
});
