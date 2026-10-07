export const registry = {
  _id: 0,
  generateId: function () { return ++this._id; },
  registerHandler: function (type, handler) {
    const id = this.generateId();
    this.handlers[type][id] = handler;
    return id;
  },
  handlers: {
    onClick: {},
    onSubmit: {},
    onChange: {},
    onInput: {},
    onMouseEnter: {},
    onMouseLeave: {},
    onContextMenu: {},
  },
};

export const handlersTypes = Object.keys(registry.handlers);

export function cleanDeadHandlers() {
  const { handlers } = registry;
  for (const type of handlersTypes) {
    const ids = Object.keys(handlers[type]);
    if (!ids.length) continue;

    const attribute = `data-${type.toLowerCase()}`;
    const elements = document.querySelectorAll(`[${attribute}]`);
    const aliveIds = new Set(
      Array.from(elements, (element) => element.getAttribute(attribute)),
    );

    for (const id of ids) {
      if (!aliveIds.has(id)) {
        delete handlers[type][id];
      }
    }
  }
}

export const initListeners = () => {
  const { handlers } = registry;

  const handleClick = (e) => {
    const { onclick } = e.target.closest('[data-onclick]')
      ? e.target.closest('[data-onclick]').dataset
      : { handler: null };
    if (handlers.onClick[onclick]) {
      handlers.onClick[onclick](e);
    }
  };

  const handleSubmit = (e) => {
    const { onsubmit } = e.target.dataset;
    e.preventDefault();

    if (handlers.onSubmit[onsubmit]) {
      handlers.onSubmit[onsubmit](e);
    }
  };

  const handleChange = (e) => {
    const { onchange } = e.target.dataset;
    if (handlers.onChange[onchange]) {
      handlers.onChange[onchange](e);
    }
  };

  const handleInput = (e) => {
    const { oninput } = e.target.dataset;
    if (handlers.onInput[oninput]) {
      handlers.onInput[oninput](e);
    }
  };

  const handleMouseEnter = (e) => {
    if (e.target.dataset) {
      const { onmouseenter } = e.target.dataset;
      if (handlers.onMouseEnter[onmouseenter]) {
        handlers.onMouseEnter[onmouseenter](e);
      }
    }
  };

  const handleMouseLeave = (e) => {
    if (e.target.dataset) {
      const { onmouseleave } = e.target.dataset;
      if (handlers.onMouseLeave[onmouseleave]) {
        handlers.onMouseLeave[onmouseleave](e);
      }
    }
  };

  const handleContextMenu = (e) => {
    const { oncontextmenu } = e.target.closest('[data-oncontextmenu]')
      ? e.target.closest('[data-oncontextmenu]').dataset
      : { handler: null };

    if (handlers.onContextMenu[oncontextmenu]) {
      e.preventDefault();
      handlers.onContextMenu[oncontextmenu](e);
    }
  };

  document.addEventListener('click', handleClick);
  document.addEventListener('submit', handleSubmit);
  document.addEventListener('change', handleChange);
  document.addEventListener('input', handleInput);
  document.addEventListener('mouseenter', handleMouseEnter, true);
  document.addEventListener('mouseleave', handleMouseLeave, true);
  document.addEventListener('contextmenu', handleContextMenu);
};
