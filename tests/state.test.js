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
  const store = createStore([
    { id: '1', name: 'Lamp', price: 10, estimatedValue: 40, category: 'Art' },
    { id: '2', name: 'Book', price: 5, estimatedValue: null, category: 'Books' }
  ]);
  assert.deepEqual(store.getStats(), { totalItems: 2, totalSpent: 15, totalSavings: 30 });
});

test('store returns only the active category', () => {
  const store = createStore([
    { id: 'a', name: 'Novel', price: 3, category: 'Books' },
    { id: 'b', name: 'Print', price: 8, category: 'Art' }
  ]);
  store.setFilter('Books');
  assert.deepEqual(store.getFilteredFinds().map((item) => item.id), ['a']);
});

test('store adds then deletes a valid find and refreshes totals', () => {
  const store = createStore();
  const added = store.add({ name: 'Copper kettle', price: '14', estimatedValue: '45', category: 'Kitchenware' });
  assert.equal(added.valid, true);
  assert.deepEqual(store.getStats(), { totalItems: 1, totalSpent: 14, totalSavings: 31 });
  store.remove(added.value.id);
  assert.deepEqual(store.getStats(), { totalItems: 0, totalSpent: 0, totalSavings: 0 });
});
