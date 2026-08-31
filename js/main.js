import { loadFinds, saveFinds } from './storage.js';
import { createStore } from './state.js';
import { renderApp, renderLoading, renderToast } from './render.js';
import { bindEvents } from './events.js';

async function startApp() {
  renderLoading(); await new Promise((resolve) => setTimeout(resolve, 420));
  const loaded = loadFinds(); if (loaded.issue) console.warn(loaded.issue);
  const store = createStore(loaded.finds); const rerender = () => renderApp(store);
  rerender(); bindEvents({ store, rerender, persist: () => saveFinds(store.getFinds()), toast: renderToast });
}
startApp();
