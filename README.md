# WoodJSX

A small JSX framework that creates real DOM nodes. No virtual DOM, hooks,
automatic reactivity, or runtime dependencies.

Components are plain functions. State is ordinary JavaScript. You decide
when to update the UI by calling `render()` or using the DOM API directly.

## Quick start

Create a project from [woodjsx-template](https://github.com/sseezov/woodjsx-template),
install dependencies, and start the dev server:

```sh
npx --yes degit sseezov/woodjsx-template my-app && cd my-app && npm install && npm run dev
```

Replace `my-app` with your project directory name. `degit` downloads the template
without its Git history, so there is no `.git` directory to remove.

## Manual setup

Install WoodJSX and Vite in your project:

```sh
npm install woodjsx
npm install -D vite@8
```

Configure JSX for WoodJSX in `vite.config.js`:

```js
import { defineConfig } from 'vite'

const jsx = {
  runtime: 'classic',
  pragma: 'h',
  pragmaFrag: 'Fragment',
  development: false,
}

export default defineConfig({
  oxc: {
    jsx,
    jsxInject: "import { h, Fragment } from 'woodjsx'",
  },
  optimizeDeps: {
    rolldownOptions: { transform: { jsx } },
  },
})
```

This uses the [Vite 8 JSX configuration](https://vite.dev/config/shared-options.html#oxc)
and applies the same JSX transform during dependency scanning.

Create `index.html`:

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>WoodJSX</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/index.js"></script>
  </body>
</html>
```

Create `src/index.js`:

```js
import { initWood } from 'woodjsx'
import App from './App.jsx'

initWood(App, '#app')
```

Create `src/App.jsx`:

```jsx
import { render } from 'woodjsx'

export default function App() {
  let count = 0

  const increment = () => {
    count++
    render('#counter', count)
  }

  return (
    <main>
      <p>Count: <span id="counter">{count}</span></p>
      <button onClick={increment}>Increment</button>
    </main>
  )
}
```

Run `npx vite` to start the dev server or `npx vite build` to build the app.

## How updates work

`render(selector, content)` replaces all children of the selected element.
It accepts a DOM node, text, or a promise resolving to either:

```jsx
await render('#content', <Page />)
```

Changing a variable does not update the page. Call `render()` for the part
that needs updating. Replacing a component runs its function again, so keep
state outside it when that state needs to survive a replacement.

Components accept props and can return fragments (`<>...</>`). JSX uses
HTML attributes such as `class`. For conditional content, use
`condition ? <Content /> : ''`: values such as `false` and `null` become text.

Attribute values `0` and `''` are preserved; `null` and `undefined` omit the
attribute. Boolean values toggle presence attributes such as `disabled`,
`checked`, `hidden`, `download`, and `capture`: `false` omits the attribute and
`true` sets an empty value. String values are preserved. Other attributes,
including `aria-*`, `data-*`, and `contenteditable`, keep `false` as `"false"`.

## Router

The framework includes a [small client-side router](src/router.js).
Import route components and navigation helpers directly from the package:

```js
import { Route, Routes, redirect, navigateBack, refreshPage } from 'woodjsx'
```

`Routes` registers its `Route` children with a shared `mountTo` selector.
Each `Route` takes a `path` and a `component`. Register routes while creating
`App`; `initWood` mounts the matching page after the app layout is in the DOM.
Use `redirect(path)` to navigate, `navigateBack()` to go back, and
`refreshPage()` to render the current route again.

## Tests

Browser tests run in Chromium using Playwright. Set up once:

```sh
npm ci
npx playwright install chromium
```

Run `npm test`, or `npm run test:headed` to see the browser.
The test server starts and stops automatically; port 4178 must be free.
Tests cover JSX, events, rendering and handler cleanup, and routing.

Tests and development dependencies are not included in the published package.
Use `npm pack --dry-run` to inspect its contents without publishing.

## Status

Under active development, before 1.0. The API may change.

MIT license.
