import { test, expect } from './fixtures.js';

test('preserves zero and empty attributes while omitting nullish values', async ({ page }) => {
  const attrs = await page.evaluate(() => {
    const { h } = core;
    const input = h('input', { tabindex: 0, value: 0, min: 0, title: '', name: null, placeholder: undefined });
    const image = h('img', { alt: '' });
    const circle = h('circle', { opacity: 0 });
    return {
      tabindex: input.getAttribute('tabindex'), value: input.value, min: input.min,
      title: input.getAttribute('title'), name: input.hasAttribute('name'),
      placeholder: input.hasAttribute('placeholder'), alt: image.getAttribute('alt'),
      opacity: circle.getAttribute('opacity'),
    };
  });
  expect(attrs).toEqual({
    tabindex: '0', value: '0', min: '0', title: '', name: false,
    placeholder: false, alt: '', opacity: '0',
  });
});

test('preserves false for ARIA, data and enumerated attributes', async ({ page }) => {
  const attrs = await page.evaluate(() => {
    const element = core.h('div', {
      'aria-expanded': false, 'data-active': false,
      contenteditable: false, draggable: false, spellcheck: false,
    });
    return Object.fromEntries(Array.from(element.attributes, attr => [attr.name, attr.value]));
  });
  expect(attrs).toEqual({
    'aria-expanded': 'false', 'data-active': 'false',
    contenteditable: 'false', draggable: 'false', spellcheck: 'false',
  });
});

test('boolean form attributes control native DOM state', async ({ page }) => {
  const result = await page.evaluate(() => {
    const { h } = core;
    const props = { type: 'checkbox', disabled: false, checked: false, readonly: false, required: false };
    const off = h('input', props);
    const on = h('input', { ...props, disabled: true, checked: true, readonly: true, required: true });
    const state = element => [element.disabled, element.checked, element.readOnly, element.required];
    return {
      off: state(off), on: state(on),
      offAttributes: ['disabled', 'checked', 'readonly', 'required'].map(key => off.hasAttribute(key)),
      onAttributes: ['disabled', 'checked', 'readonly', 'required'].map(key => on.getAttribute(key)),
    };
  });
  expect(result).toEqual({
    off: [false, false, false, false], on: [true, true, true, true],
    offAttributes: [false, false, false, false], onAttributes: ['', '', '', ''],
  });
});

test('hidden, download and capture retain string values and support boolean toggles', async ({ page }) => {
  const values = await page.evaluate(() => {
    const { h } = core;
    return [['div', 'hidden', 'until-found'], ['a', 'download', 'report.csv'], ['input', 'capture', 'environment']]
      .map(([tag, key, text]) => [false, true, '', text].map(value => h(tag, { [key]: value }).getAttribute(key)));
  });
  expect(values).toEqual([
    [null, '', '', 'until-found'],
    [null, '', '', 'report.csv'],
    [null, '', '', 'environment'],
  ]);
});
