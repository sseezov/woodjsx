import { handlersTypes, registry } from './handlers';

// Boolean JSX values toggle these attributes; string values are kept as-is.
const presenceAttributes = new Set([
  'allowfullscreen', 'async', 'autofocus', 'autoplay', 'checked', 'controls',
  'default', 'defer', 'disabled', 'formnovalidate', 'inert', 'ismap', 'itemscope',
  'loop', 'multiple', 'muted', 'nomodule', 'novalidate', 'open', 'playsinline',
  'readonly', 'required', 'reversed', 'selected', 'capture', 'download', 'hidden',
]);

const setProps = (element, props) => {
  Object.entries(props).forEach(([key, value]) => {
    if (handlersTypes.includes(key)) { // сетаем обработчик
      const handlerId = registry.registerHandler(key, value);
      element.setAttribute(`data-${key.toLowerCase()}`, handlerId);
    }
    else {
      if (value === null || value === undefined) return;
      const isPresenceAttribute = presenceAttributes.has(key.toLowerCase());
      if (isPresenceAttribute && value === false) return;
      element.setAttribute(key, isPresenceAttribute && value === true ? '' : value);
    }
  });
};

const isSvg = (tag) => [
  'svg', 'path', 'circle', 'rect', 'line', 'g', 'defs',
  'use', 'text', 'tspan', 'ellipse', 'polygon', 'polyline',
].includes(tag);

const toTextNode = (child) => (
  child instanceof Node
    ? child
    : document.createTextNode(String(child))
);

export function h(tag, props, ...children) {
  const flatChildren = children.flat();

  if (tag === 'Fragment') {
    const fragment = document.createDocumentFragment();
    flatChildren.forEach((child) => fragment.append(toTextNode(child)));
    return fragment;
  }

  if (typeof tag === 'function') {
    return tag({ ...props, children: flatChildren });
  }

  const element = isSvg(tag)
    ? document.createElementNS('http://www.w3.org/2000/svg', tag)
    : document.createElement(tag);

  if (props) {
    setProps(element, props);
  }

  flatChildren.forEach((child) => element.appendChild(toTextNode(child)));

  return element;
}

export const Fragment = 'Fragment';
