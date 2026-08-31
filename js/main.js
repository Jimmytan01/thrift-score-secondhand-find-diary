import { loadFinds, saveFinds } from './storage.js';
import { createStore } from './state.js';
import { renderApp, renderLoading, renderToast } from './render.js';
import { bindEvents } from './events.js';

export async function startApp({ load = loadFinds, create = createStore, loading = renderLoading, render = renderApp, toast = renderToast, bind = bindEvents, delay = () => new Promise((resolve) => setTimeout(resolve, 420)) } = {}) {
  loading(); await delay();
  const loaded = load();
  const store = create(loaded.finds); const rerender = () => render(store);
  rerender();
  if (loaded.issue) { console.warn(loaded.issue); toast(loaded.issue); }
  bind({ store, rerender, persist: () => saveFinds(store.getFinds()), toast });
}
if (typeof document !== 'undefined') startApp();
