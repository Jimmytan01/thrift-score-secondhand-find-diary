import test from 'node:test';
import assert from 'node:assert/strict';
import { cardMarkup } from '../js/render.js';

test('card markup escapes a name and shows the category and emoji', () => {
  const markup = cardMarkup({ id: '1', name: '<Rare>', price: 12, estimatedValue: null, category: 'Books', emoji: '📚', description: '' });
  assert.match(markup, /&lt;Rare&gt;/);
  assert.match(markup, /badge-books/);
  assert.match(markup, /📚/);
  assert.match(markup, /\$12\.00/);
});
