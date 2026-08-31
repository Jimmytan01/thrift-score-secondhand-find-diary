const $ = (selector) => document.querySelector(selector);
const wait = (time = 380) => new Promise((resolve) => setTimeout(resolve, time));

export function formToInput(formData) {
  const get = (name) => formData.get(name) || '';
  return Object.fromEntries(['name', 'place', 'price', 'estimatedValue', 'category', 'foundDate', 'photoUrl', 'emoji', 'description'].map((name) => [name, get(name)]));
}
export function fallbackVisual(image) { image.hidden = true; if (image.nextElementSibling) image.nextElementSibling.hidden = false; }

export function bindEvents({ store, rerender, persist, toast }) {
  const addDialog = $('#add-find-dialog'), deleteDialog = $('#delete-dialog'), form = $('#add-find-form'); let deleting = null;
  document.addEventListener('click', (event) => {
    const open = event.target.closest('#open-add'); if (open) { form.foundDate.value = new Date().toISOString().slice(0, 10); addDialog.showModal(); }
    const close = event.target.closest('[data-close]'); if (close) $("#" + close.dataset.close).close();
    const filter = event.target.closest('[data-filter]'); if (filter) { store.setFilter(filter.dataset.filter); rerender(); }
    const remove = event.target.closest('[data-delete]'); if (remove) { deleting = remove.dataset.delete; deleteDialog.showModal(); }
  });
  document.addEventListener('error', (event) => { if (event.target.matches('.visual img')) fallbackVisual(event.target); }, true);
  form.addEventListener('submit', async (event) => {
    event.preventDefault(); const button = $('#save-find'), original = button.textContent, result = store.add(formToInput(new FormData(form)));
    form.querySelectorAll('[data-error]').forEach((node) => { node.textContent = result.errors?.[node.dataset.error] || ''; });
    if (!result.valid) return; button.disabled = true; button.textContent = 'Saving…'; await wait(); persist(); rerender(); form.reset(); addDialog.close(); toast('Score logged — your cabinet sparkles ✦'); button.disabled = false; button.textContent = original;
  });
  deleteDialog.addEventListener('close', async () => {
    if (deleteDialog.returnValue !== 'confirm' || !deleting) return; const button = $('#confirm-delete'), original = button.textContent; button.disabled = true; button.textContent = 'Removing…'; await wait(); store.remove(deleting); persist(); rerender(); toast('Find removed from the diary.'); button.disabled = false; button.textContent = original; deleting = null;
  });
}
