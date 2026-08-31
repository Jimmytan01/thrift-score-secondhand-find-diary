import test from 'node:test';
import assert from 'node:assert/strict';
import { fallbackVisual, formToInput } from '../js/events.js';

test('formToInput returns an emoji when no photo is supplied', () => {
  const input = formToInput(new Map([['name', 'Mug'], ['price', '4'], ['emoji', '☕']]));
  assert.equal(input.photoUrl, '');
  assert.equal(input.emoji, '☕');
});

test('fallbackVisual hides a failed image and reveals its fallback', () => {
  const image = { hidden: false, nextElementSibling: { hidden: true } };
  fallbackVisual(image);
  assert.equal(image.hidden, true);
  assert.equal(image.nextElementSibling.hidden, false);
});
