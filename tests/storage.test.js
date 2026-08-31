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

test('saved finds survive a subsequent load', () => {
  let value = null;
  const storage = { getItem: () => value, setItem: (_key, next) => { value = next; } };
  assert.equal(saveFinds([{ id: 'cup', price: 3 }], storage).ok, true);
  assert.deepEqual(loadFinds(storage), { finds: [{ id: 'cup', price: 3 }], issue: null });
});
