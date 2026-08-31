const $ = (selector) => document.querySelector(selector);
const esc = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character]);
const money = (value) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value || 0);
const badge = (category) => `badge-${category.toLowerCase().replace(/[^a-z]+/g, '-')}`;

export function cardMarkup(find) {
  const image = find.photoUrl ? `<img src="${esc(find.photoUrl)}" alt="${esc(find.name)}">` : '';
  const savings = find.estimatedValue == null ? 'Value unknown' : `Worth ${money(find.estimatedValue)}`;
  return `<article class="card" data-id="${esc(find.id)}"><div class="visual">${image}<span class="emoji" ${image ? 'hidden' : ''}>${esc(find.emoji || '✨')}</span></div><div class="content"><div class="meta"><span class="badge ${badge(find.category)}">${esc(find.category)}</span><time>${esc(find.foundDate || '')}</time></div><h3>${esc(find.name)}</h3><p class="description">${esc(find.description || find.place || 'A fresh addition to the cabinet.')}</p><div class="money"><span>Paid <b>${money(find.price)}</b></span><span>${savings}</span></div><button class="delete" data-delete="${esc(find.id)}">Remove</button></div></article>`;
}

export function renderLoading() {
  $('#stats').innerHTML = '<div class="stat"><span>Loading your cabinet…</span><b>—</b></div>'.repeat(3);
  $('#find-grid').innerHTML = '<div class="skeleton"></div>'.repeat(3);
}

export function renderApp(store) {
  const stats = store.getStats();
  $('#stats').innerHTML = `<div class="stat"><span>Total finds</span><b>${stats.totalItems}</b></div><div class="stat"><span>Total spent</span><b>${money(stats.totalSpent)}</b></div><div class="stat"><span>Estimated savings</span><b>${money(stats.totalSavings)}</b></div>`;
  const active = store.getFilter();
  $('#filters').innerHTML = ['All', ...store.getCategories()].map((category) => `<button class="filter ${active === category ? 'active' : ''}" data-filter="${esc(category)}">${esc(category)}</button>`).join('');
  const finds = store.getFilteredFinds();
  $('#find-grid').innerHTML = finds.length ? finds.map(cardMarkup).join('') : `<div class="empty"><span class="emoji">${active === 'All' ? '🧺' : '🔎'}</span><h2>${active === 'All' ? 'Your cabinet is waiting' : `No ${esc(active)} finds yet`}</h2><p>${active === 'All' ? 'Log your first lucky find and start building your story.' : 'Try another shelf, or log a new score.'}</p></div>`;
}

export function renderToast(message) {
  const toast = $('#toast'); toast.textContent = message; toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2600);
}
