# Thrift Score — Secondhand Find Diary

## Purpose

Thrift Score is a single-page, local-first diary for secondhand finds. It helps a flea-market hunter remember each score, browse their collection, and see the value they have uncovered over time.

## Architecture

The app uses plain HTML, CSS, and browser ES modules with no dependencies or backend. `index.html` contains only the accessible structural shell and loads `js/main.js` as a module. `styles.css` owns the responsive visual design.

JavaScript is split by responsibility:

- `storage.js`: safe localStorage read/write, serialization, and malformed-data recovery.
- `state.js`: in-memory find data, validation, filters, category management, and derived totals.
- `render.js`: loading skeleton, stats, category controls, cards, empty states, and transient feedback UI.
- `events.js`: form/modal, filter, add, delete-confirmation, pending states, and image fallback behavior.
- `main.js`: creates state and connects storage, rendering, and events.

Pure state and storage utilities will have zero-dependency browser-run tests. The page itself remains directly openable from the filesystem or any static HTTP server.

## Data model

Each find is a serializable object:

```js
{
  id: "unique string",
  name: "required string",
  description: "string",
  place: "string",
  price: 0,
  estimatedValue: 0 | null,
  category: "Clothing",
  foundDate: "YYYY-MM-DD",
  photoUrl: "string",
  emoji: "string",
  createdAt: "ISO timestamp"
}
```

The initial category list is Clothing, Furniture, Books, Electronics, Art, and Kitchenware. The add form also permits a custom category, which becomes available as a filter for the current collection. All money displays use USD formatting. A missing date defaults to today; a missing visual uses a chosen emoji, then a treasure-themed placeholder.

## User experience

The visual direction is a lively trophy cabinet: warm paper-like background, rich ink, jewel-toned category badges, collectible card treatments, and small celebratory details. A responsive stats strip communicates collection size, spend, and known savings at a glance. The grid uses one column on small screens and automatically expands on wider screens.

The initial render is a lightweight skeleton while safe storage loading completes. With no finds, the grid shows a friendly illustrated invitation. A category with no matching finds receives a specific, recoverable empty-filter message.

The add form is a dialog with native validation messages plus inline errors. Add and delete controls enter a short disabled “Saving…” / “Removing…” state before state and storage update. A successful add closes the dialog, refreshes the grid and totals, then shows a celebratory toast. Delete requires a confirmation dialog before removal.

Cards prevent long text from breaking layout through clamped descriptions and wrapping names. Images use an `error` handler to hide a broken URL and display the card emoji or fallback illustration.

## Data flow and resilience

On startup, `main.js` asks `storage.js` for saved data, waits briefly to make loading deliberate, sanitizes it through `state.js`, then renders. LocalStorage exceptions or malformed JSON are caught, logged to the console, and replaced with an empty collection; the app remains usable. Mutations validate input, update in-memory state, persist safely, and re-render all derived UI.

Estimated savings is the sum of `(estimatedValue - price)` only for records that have an estimated value; records without one are excluded from that aggregate.

## Verification

Tests will cover validation, derived totals, filtering, localStorage recovery, and persistence. Manual browser checks will cover the required-only form path, fully populated form path, refresh persistence, empty and filtered empty states, delete confirmation, broken-photo fallback, and mobile layout. A final size check will exclude `.git` and verify source artifacts remain below 40 KB.
