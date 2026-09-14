# WoodJSX

**A tiny JSX framework built directly on the native DOM.**

WoodJSX lets you build web interfaces with JSX while keeping the browser's
native DOM model explicit.

No virtual DOM.  
No hooks.  
No automatic reactivity.  
No runtime dependencies.

You decide what gets updated and when.

**~1.6 KB minified + Brotli, including the router.**

## Why WoodJSX?

Most frontend frameworks introduce a runtime that tracks state changes and
decides when parts of the UI should update.

WoodJSX takes a different approach.

JSX creates real DOM nodes, application state stays ordinary JavaScript,
and UI updates happen explicitly:

```js
render('#content', <Content />)
```

This keeps the rendering model small and predictable while allowing you
to use the native DOM API whenever it is the simplest solution.

```js
document.querySelector(...)
element.classList.add(...)
element.addEventListener(...)
```

The DOM is not an escape hatch in WoodJSX — it is the platform WoodJSX
is built on.

## Features

- JSX components and fragments
- Real DOM nodes — no Virtual DOM
- Explicit rendering
- Built-in client-side router
- Event delegation
- Async top-level rendering
- Zero runtime dependencies
- Works with Vite
- Small enough to read the entire runtime source in a few minutes

## Installation

```bash
npm install woodjsx
```

## Quick Start

### `index.html`

```html
<body>
  <div id="app"></div>
  <script type="module" src="/src/index.js"></script>
</body>
```

### `src/index.js`

```js
import { initWood } from 'woodjsx'
import App from './App.jsx'

initWood(App, '#app')
```

### `src/App.jsx`

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
      <h1>WoodJSX</h1>

      <p>
        Count: <span id="counter">{count}</span>
      </p>

      <button onClick={increment}>
        Increment
      </button>
    </main>
  )
}
```

There is no hidden state synchronization here.

`count` is ordinary JavaScript state, and `render()` explicitly updates
the part of the page that changed.

## Rendering

```jsx
import { render } from 'woodjsx'

render('#content', <Page />)
```

`render()` replaces the contents of the selected DOM element.

This makes update boundaries explicit:

```jsx
render('#toolbar', <Toolbar />)
render('#schedule', <Schedule />)
render('#sidebar', <Sidebar />)
```

You decide how large or small each update should be.

## Components

Components are ordinary functions:

```jsx
function Greeting({ name }) {
  return <h1>Hello, {name}!</h1>
}
```

Use them like normal JSX components:

```jsx
<Greeting name="World" />
```

## Fragments

```jsx
function UserInfo() {
  return (
    <>
      <h2>Sergey</h2>
      <p>Frontend developer</p>
    </>
  )
}
```

## Router

WoodJSX includes a small client-side router.

```jsx
import {
  Route,
  Routes
} from 'woodjsx'

import Layout from './Layout.jsx'
import HomePage from './pages/HomePage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'

export default function App() {
  return (
    <Layout>
      <Routes mountTo="#main">
        <Route
          path="/"
          component={HomePage}
        />

        <Route
          path="/settings"
          component={SettingsPage}
        />

        <Route
          path="*"
          component={NotFoundPage}
        />
      </Routes>
    </Layout>
  )
}
```

Navigate programmatically:

```js
import { redirect } from 'woodjsx'

redirect('/settings')
```

## Vite Configuration

```js
import { defineConfig } from 'vite'

export default defineConfig({
  esbuild: {
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    jsxInject: `import { h, Fragment } from 'woodjsx'`
  }
})
```

## Philosophy

WoodJSX is intentionally low-level.

It does not try to hide the DOM or automatically synchronize application
state with the interface.

The basic model is:

```text
user action
    ↓
change ordinary JavaScript state
    ↓
render the part of the UI that changed
```

This makes application behavior easy to trace and keeps framework runtime
complexity small.

WoodJSX works particularly well when you want:

- JSX without a large runtime
- direct access to native browser APIs
- explicit control over updates
- predictable rendering behavior
- a small framework that can be understood by reading its source

WoodJSX may not be the right choice when you specifically want a large
ecosystem, automatic fine-grained reactivity, server components, or a
fully managed application runtime.

## Built with WoodJSX

WoodJSX is developed alongside a real production application rather than
only synthetic examples.

It is currently used to build a scheduling management SaaS with:

- a large administration interface
- schedule editing
- optimistic UI updates
- client-side caching
- server-injected initial state
- multiple frontend applications
- public schedule pages
- E2E testing

This application is used as the main dogfooding environment for the
framework.

## Status

WoodJSX is currently under active development and has not reached 1.0 yet.

The API may change while real-world usage continues to shape the framework.

## License

MIT
