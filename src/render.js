import { removeHandlers } from './handlers.js';

export async function render(parentSelector, content) {
  const element = await content;
  const parent = document.querySelector(parentSelector);
  const previousNodes = Array.from(parent.childNodes);

  parent.replaceChildren(element);
  removeHandlers(previousNodes);
};
