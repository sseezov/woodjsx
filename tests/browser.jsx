import * as wood from '../src/index.js';
import * as handlers from '../src/handlers.js';
import * as router from '../src/router.js';

const { h, Fragment, initWood, render } = wood;

function Greeting({ name, children }) {
  return <section class="greeting"><h1>Hello {name}</h1>{children}</section>;
}

function Counter() {
  let count = 0;
  return <>
    <span id="count">{count}</span>
    <button onClick={() => render('#count', ++count)}>Increment</button>
  </>;
}

window.fixtures = {
  mountCounter: () => render('#app', <Counter />),
  mountComponents: () => render('#app', <>
    <Greeting name="WoodJSX">
      <input aria-label="Name" required disabled={false} />
      {[1, 2].map(number => <p data-number={number}>{number}</p>)}
    </Greeting>
    <svg viewBox="0 0 10 10"><circle cx="5" cy="5" r="2" /></svg>
  </>),
};

await initWood(() => '', '#app');
window.core = { ...wood, ...handlers, ...router };
