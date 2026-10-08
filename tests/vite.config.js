import { defineConfig } from 'vite';

const jsx = {
  runtime: 'classic',
  pragma: 'h',
  pragmaFrag: 'Fragment',
  development: false,
};

export default defineConfig({
  oxc: { jsx },
  optimizeDeps: { rolldownOptions: { transform: { jsx } } },
});
