# Thrift Score Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a responsive, local-first diary that records secondhand finds and highlights their financial wins.

**Architecture:** Plain HTML loads a small ES-module graph. Storage is isolated behind defensive read/write helpers, state owns validation and totals, render owns DOM projection, events owns user interaction, and main composes them. Browser-native tests exercise pure modules without third-party dependencies.

**Tech Stack:** HTML5, CSS3, vanilla JavaScript ES modules, localStorage, Node.js built-in test runner.

**Spec:** `docs/superpowers/specs/2026-08-31-thrift-score-design.md`

## Global Constraints

- No backend; persist data in `localStorage` only.
- Use no dependencies and keep all non-`.git` repository files under 40 KB.
- Use real ES modules; do not collapse app logic into one HTML file or IIFE.
- Initial categories: Clothing, Furniture, Books, Electronics, Art, Kitchenware; accept a custom category.
- Price is required and non-negative; estimated value is optional but non-negative when supplied.
- Safely recover from unavailable storage or corrupted persisted JSON.
- Use `YYYY-MM-DD` dates and USD currency display.

---

## File Structure

- `index.html`: accessible page shell, controls, add dialog, delete dialog, toast host.
- `styles.css`: visual tokens, responsive layout, category badges, loading/pending/empty states.
- `js/storage.js`: safe serialization, retrieval, storage-error result objects.
- `js/state.js`: find validation, normalization, filters, totals, and in-memory store methods.
- `js/render.js`: stat, category, card, skeleton, and empty-state DOM renderers.
- `js/events.js`: modal, form, confirmation, image fallback, and pending-operation bindings.
- `js/main.js`: boot sequence and dependency composition.
- `tests/state.test.js`: validation, filtering, totals tests.
- `tests/storage.test.js`: JSON and unavailable-storage recovery tests.
- `package.json`: `node --test` script only; no dependencies.

### Task 1: Establish module contract and test harness

**Files:**
- Create: `package.json`, `tests/state.test.js`, `js/state.js`

**Interfaces:**
- Produces: `DEFAULT_CATEGORIES`, `validateFind(input)`, `createStore(initialFinds)`.
- `validateFind` returns `{ valid: boolean, errors: Record<string,string>, value?: Find }`.
- Store exposes `getFinds()`, `getFilteredFinds()`, `setFilter(category)`, `add(find)`, `remove(id)`, and `getStats()`.

- [ ] **Step 1: Write failing tests for required-price validation and aggregates**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { createStore, validateFind } from '../js/state.js';

test('validateFind rejects a blank name and non-numeric price', () => {
  const result = validateFind({ name: '', price: 'free' });
  assert.equal(result.valid, false);
  assert.equal(result.errors.name, 'Item name is required.');
  assert.equal(result.errors.price, 'Enter a non-negative price.');
});

test('store totals count only records with an estimated value', () => {
  const store = createStore([{ id: '1', name: 'Lamp', price: 10, estimatedValue: 40, category: 'Art' }, { id: '2', name: 'Book', price: 5, estimatedValue: null, category: 'Books' }]);
  assert.deepEqual(store.getStats(), { totalItems: 2, totalSpent: 15, totalSavings: 30 });
});
```

- [ ] **Step 2: Run the tests and verify failure**

Run: `node --test tests/state.test.js`  
Expected: FAIL because `js/state.js` does not exist.

- [ ] **Step 3: Implement the minimal state module**

```js
export const DEFAULT_CATEGORIES = ['Clothing', 'Furniture', 'Books', 'Electronics', 'Art', 'Kitchenware'];
export function validateFind(input) { /* return errors or normalized Find */ }
export function createStore(initialFinds = []) { /* retain list/filter and derive stats */ }
```

Normalization must trim text, turn blank estimated values into `null`, reject negative numeric values, generate an id for `add`, and default missing date to today.

- [ ] **Step 4: Run state tests and verify green**

Run: `node --test tests/state.test.js`  
Expected: PASS with 2 passing tests.

- [ ] **Step 5: Add filter test, implement it, and rerun**

```js
test('store returns only the active category', () => {
  const store = createStore([{ id: 'a', category: 'Books' }, { id: 'b', category: 'Art' }]);
  store.setFilter('Books');
  assert.deepEqual(store.getFilteredFinds().map((item) => item.id), ['a']);
});
```

Run: `node --test tests/state.test.js`; implement exact-match filtering with `All` returning every record; rerun until PASS.

- [ ] **Step 6: Commit**

```bash
git add package.json js/state.js tests/state.test.js
git commit -m "feat: add find state and validation"
```

### Task 2: Add resilient persistence

**Files:**
- Create: `js/storage.js`, `tests/storage.test.js`

**Interfaces:**
- Consumes: saved `Find[]` serialized under `thrift-score-finds`.
- Produces: `loadFinds(storage) -> { finds: Find[], issue: string | null }` and `saveFinds(finds, storage) -> { ok: boolean, issue: string | null }`.

- [ ] **Step 1: Write failing recovery tests**

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { loadFinds, saveFinds } from '../js/storage.js';

test('loadFinds recovers from invalid JSON', () => {
  const storage = { getItem: () => '{broken' };
  assert.deepEqual(loadFinds(storage), { finds: [], issue: 'Stored finds could not be read.' });
});

test('saveFinds reports unavailable storage without throwing', () => {
  const storage = { setItem: () => { throw new Error('blocked'); } };
  assert.equal(saveFinds([], storage).ok, false);
});
```

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/storage.test.js`  
Expected: FAIL because `js/storage.js` does not exist.

- [ ] **Step 3: Implement safe storage helpers**

```js
const KEY = 'thrift-score-finds';
export function loadFinds(storage = window.localStorage) { /* catch getItem and JSON.parse; require array */ }
export function saveFinds(finds, storage = window.localStorage) { /* catch JSON.stringify/setItem */ }
```

Log caught exceptions with `console.warn`; return the prescribed recovery objects without propagating errors.

- [ ] **Step 4: Run storage and full test suite**

Run: `node --test`  
Expected: PASS with state and storage tests green.

- [ ] **Step 5: Commit**

```bash
git add js/storage.js tests/storage.test.js
git commit -m "feat: add resilient local storage"
```

### Task 3: Build the accessible visual shell and responsive trophy-cabinet styling

**Files:**
- Create: `index.html`, `styles.css`

**Interfaces:**
- Produces DOM targets: `#stats`, `#filters`, `#find-grid`, `#add-find-dialog`, `#add-find-form`, `#delete-dialog`, `#toast`.
- `render.js` will write only inside those targets.

- [ ] **Step 1: Add a minimal static page and inspect it**

Include a header with an add button, a three-item stats section, filter nav, grid section with an `aria-live` state node, add dialog fields for every model property, delete confirmation dialog, and toast region. Link `styles.css` and module script `js/main.js`.

- [ ] **Step 2: Create responsive CSS**

Define warm parchment, dark-ink, and jewel-tone CSS variables; use a `minmax(220px, 1fr)` grid; clamp card descriptions; set dialog, button focus, skeleton shimmer, card hover, category-badge, toast, and pending styles. Include a narrow-width media query that stacks header actions and stats.

- [ ] **Step 3: Manually verify static layout**

Open `index.html` through a static server and check 375px and desktop widths. Expected: no horizontal overflow and the main controls remain reachable by keyboard.

- [ ] **Step 4: Commit**

```bash
git add index.html styles.css
git commit -m "feat: add responsive Thrift Score shell"
```

### Task 4: Render collection, stats, and empty/loading states

**Files:**
- Create: `js/render.js`
- Modify: `index.html`, `styles.css`

**Interfaces:**
- Consumes: store methods, DOM targets from Task 3.
- Produces: `renderApp(store)`, `renderLoading()`, `renderToast(message)`.

- [ ] **Step 1: Write browser-testable card markup assertions**

Create `tests/render.test.js` with a lightweight fake DOM object and assert that a card markup factory includes its escaped name, category class, formatted price, and emoji fallback. Export `cardMarkup(find)` from `render.js` for the test.

- [ ] **Step 2: Run render test and verify it fails**

Run: `node --test tests/render.test.js`  
Expected: FAIL because `js/render.js` does not exist.

- [ ] **Step 3: Implement focused rendering**

Render a three-stat bar, All plus category filter buttons, cards, and two distinct empty messages. `renderLoading` must place at least three skeleton cards before the first storage read. Escape user strings before interpolation; attach image `onerror` behavior through `events.js` rather than inline HTML.

- [ ] **Step 4: Run full test suite and manually check states**

Run: `node --test`  
Expected: PASS. In browser verify: initial skeleton, friendly no-finds state, and the category-no-results message.

- [ ] **Step 5: Commit**

```bash
git add js/render.js tests/render.test.js index.html styles.css
git commit -m "feat: render find collection states"
```

### Task 5: Wire interactions, pending feedback, and boot sequence

**Files:**
- Create: `js/events.js`, `js/main.js`
- Modify: `js/render.js`, `index.html`, `styles.css`

**Interfaces:**
- Consumes: `createStore`, `validateFind`, `loadFinds`, `saveFinds`, `renderApp`.
- Produces: `bindEvents({ store, rerender, persist })` and `startApp()`.

- [ ] **Step 1: Write failing pure event-helper tests**

Export and test `formToInput(formData)` and `fallbackVisual(image, fallback)` using simple object arguments. Assert blank image URLs choose the supplied emoji and that the handler hides an errored image.

- [ ] **Step 2: Run tests and verify failure**

Run: `node --test tests/events.test.js`  
Expected: FAIL because `js/events.js` does not exist.

- [ ] **Step 3: Implement add, filter, image, and delete behavior**

Open/close dialogs with buttons, validate form input inline, disable submit and label it `Saving…` for a short promise delay, update store then persist and rerender, close the dialog, reset form, and show a toast. Category controls call `setFilter`. Cards request delete confirmation; confirmation disables with `Removing…`, removes/persists/rerenders, then closes. Add an image error listener that replaces failed URLs with emoji/placeholder visual.

- [ ] **Step 4: Implement startup**

`startApp()` calls `renderLoading()`, waits briefly, invokes `loadFinds`, creates the store, logs an issue when supplied, renders, and binds interactions. Call `startApp()` exactly once from `main.js` after DOM availability.

- [ ] **Step 5: Run the full test suite and browser acceptance checks**

Run: `node --test`  
Expected: PASS. Manually add a required-only find and a fully populated find, refresh to confirm persistence, filter to zero results, delete after confirmation, trigger a broken photo URL, and inspect mobile width.

- [ ] **Step 6: Commit**

```bash
git add js/events.js js/main.js js/render.js index.html styles.css tests/events.test.js
git commit -m "feat: add diary interactions and persistence"
```

### Task 6: Perform final quality and size verification

**Files:**
- Modify only if verification identifies an issue.

- [ ] **Step 1: Run source tests**

Run: `node --test`  
Expected: all tests PASS with zero failures.

- [ ] **Step 2: Verify repository size**

Run: `Get-ChildItem -Recurse -File -Force | Where-Object { $_.FullName -notmatch '\\.git\\|node_modules' } | Measure-Object -Property Length -Sum`  
Expected: aggregate source size under 40,960 bytes.

- [ ] **Step 3: Re-run acceptance checklist in browser**

Check loading, localStorage recovery, validation, empty and filtered-empty states, additions, deletion, image fallback, long copy, refresh persistence, and responsive layout. Record and fix any observed failure before committing.

- [ ] **Step 4: Commit verified cleanup if needed**

```bash
git add index.html styles.css js tests package.json
git commit -m "chore: verify Thrift Score quality"
```
