import { test, expect } from './fixtures.js';

test('repeated renders keep only current handlers for every event type', async ({ page }) => {
  const counts = await page.evaluate(async () => {
    const { h, render, registry, handlersTypes } = core;
    window.clicks = 0;
    for (let i = 0; i < 100; i++) {
      const props = Object.fromEntries(handlersTypes.map(type => [type, () => { window.clicks++; }]));
      await render('#app', h('section', null, h('button', props, 'Run')));
    }
    return Object.values(registry.handlers).map(handlers => Object.keys(handlers).length);
  });
  expect(counts).toEqual(Array(7).fill(1));
  // Dispatch a click directly so mouseenter/mouseleave do not affect the count.
  await page.locator('button').dispatchEvent('click');
  expect(await page.evaluate(() => window.clicks)).toBe(1);
});

test('partial renders preserve the parent and other mounted components', async ({ page }) => {
  expect(await page.evaluate(async () => {
    const { h, render, registry } = core;
    const parent = document.querySelector('#app');
    const parentId = registry.registerHandler('onClick', () => {});
    parent.setAttribute('data-onclick', parentId);
    await render('#other', h('button', { onClick: () => {} }, 'Other'));
    const otherId = document.querySelector('#other button').dataset.onclick;
    await render('#app', h('button', { onClick: () => {} }, 'Old'));
    await render('#app', 'Empty');
    return Object.keys(registry.handlers.onClick).length === 2 &&
      !!registry.handlers.onClick[parentId] && !!registry.handlers.onClick[otherId];
  })).toBe(true);
});

test('reusing a root or nested node preserves its working handler', async ({ page }) => {
  expect(await page.evaluate(async () => {
    const { h, render, registry } = core;
    window.clicks = 0;
    const button = h('button', { onClick: () => { window.clicks++; } }, 'Keep');
    const wrapper = h('section', { onClick: () => {} }, button);
    await render('#app', wrapper);
    await render('#app', wrapper);
    await render('#app', button);
    button.click();
    return Object.keys(registry.handlers.onClick).length === 1 && window.clicks === 1;
  })).toBe(true);
});

test('cleanup leaves an asynchronous render waiting in another container intact', async ({ page }) => {
  expect(await page.evaluate(async () => {
    const { h, render, registry } = core;
    window.clicks = 0;
    const button = h('button', { onClick: () => { window.clicks++; } }, 'Pending');
    let resolveContent;
    const pending = render('#other', new Promise(resolve => { resolveContent = resolve; }));
    await render('#app', h('button', { onClick: () => {} }, 'Old'));
    await render('#app', 'Empty');
    resolveContent(button);
    await pending;
    button.click();
    return Object.keys(registry.handlers.onClick).length === 1 && window.clicks === 1;
  })).toBe(true);
});

test('fragments, root handlers and multiple handlers are cleaned when replaced by text', async ({ page }) => {
  expect(await page.evaluate(async () => {
    const { h, Fragment, render, registry } = core;
    await render('#app', h(Fragment, null, 'Text',
      h('button', { onClick: () => {}, onContextMenu: () => {} }, 'One'),
      h('section', null, h('input', { onInput: () => {} })),
    ));
    await render('#app', 'Empty');
    await render('#app', 'Still empty');
    return Object.values(registry.handlers).every(handlers => !Object.keys(handlers).length);
  })).toBe(true);
});

test('rejected content leaves the mounted component working', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { h, render, registry } = core;
    let clicks = 0;
    await render('#app', h('button', { onClick: () => clicks++ }, 'Keep'));
    let message;
    try {
      await render('#app', Promise.reject(new Error('Loading failed')));
    } catch (error) {
      message = error.message;
    }
    document.querySelector('button').click();
    return { message, clicks, count: Object.keys(registry.handlers.onClick).length };
  });
  expect(result).toEqual({ message: 'Loading failed', clicks: 1, count: 1 });
});
