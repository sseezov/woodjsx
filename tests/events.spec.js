import { test, expect } from './fixtures.js';

const events = [
  ['onClick', 'click', 'button'],
  ['onSubmit', 'submit', 'form'],
  ['onChange', 'change', 'input'],
  ['onInput', 'input', 'input'],
  ['onMouseEnter', 'mouseenter', 'div'],
  ['onMouseLeave', 'mouseleave', 'div'],
  ['onContextMenu', 'contextmenu', 'button'],
];

for (const [prop, type, tag] of events) {
  test(`${prop} invokes only the matching handler`, async ({ page }) => {
    const result = await page.evaluate(async ({ prop, type, tag }) => {
      const { h, render } = core;
      const calls = [];
      const element = h(tag, { [prop]: event => calls.push(event.type) });
      await render('#app', element);
      await render('#other', h(tag, { [prop]: () => calls.push('wrong handler') }));
      let target = element;
      if (type === 'click' || type === 'contextmenu') {
        target = h('span', null, 'Child');
        element.append(target);
      }
      const event = new Event(type, {
        bubbles: !['mouseenter', 'mouseleave'].includes(type),
        cancelable: true,
      });
      target.dispatchEvent(event);
      return { calls, prevented: event.defaultPrevented };
    }, { prop, type, tag });
    expect(result.calls).toEqual([type]);
    expect(result.prevented).toBe(['submit', 'contextmenu'].includes(type));
  });
}

test('SVG handlers work and are removed when their elements are replaced', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { h, render, registry } = core;
    const calls = [];
    const circle = h('circle', { onClick: () => calls.push('circle') });
    const svg = h('svg', { viewBox: '0 0 10 10', onClick: () => calls.push('svg') }, circle);
    await render('#app', svg);
    circle.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    svg.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    const attributes = [svg.hasAttribute('data-onclick'), circle.hasAttribute('data-onclick'), svg.getAttribute('viewBox')];
    await render('#app', 'Empty');
    return { calls, attributes, remaining: Object.keys(registry.handlers.onClick).length };
  });
  expect(result).toEqual({ calls: ['circle', 'svg'], attributes: [true, true, '0 0 10 10'], remaining: 0 });
});
