import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyPasteFallback,
  applySelectionToState,
  createInitialSidePanelState,
  extractSelectedTextFromMockPage,
  getSidePanelPreviewText,
  resolveInputText
} from '../dist/index.js';

const mockPageMarkup = `
<article>
  <p>Opening sentence.</p>
  <!-- SELECT_START -->
  Founders can warm prospects by writing one thoughtful comment each day.
  <!-- SELECT_END -->
  <p>Closing sentence.</p>
</article>
`;

test('mock page selected text is captured', () => {
  const selected = extractSelectedTextFromMockPage(mockPageMarkup);
  assert.equal(selected, 'Founders can warm prospects by writing one thoughtful comment each day.');
});

test('side panel displays selected text when available', () => {
  const initial = createInitialSidePanelState();
  const withSelection = applySelectionToState(initial, '  Focus on one clear takeaway. ');

  assert.equal(resolveInputText(withSelection), 'Focus on one clear takeaway.');
  assert.equal(getSidePanelPreviewText(withSelection), 'Focus on one clear takeaway.');
});

test('paste fallback is used when no selection exists', () => {
  const initial = createInitialSidePanelState();
  const withPaste = applyPasteFallback(initial, '  Paste fallback content from user.  ');

  assert.equal(resolveInputText(withPaste), 'Paste fallback content from user.');
  assert.equal(getSidePanelPreviewText(withPaste), 'Paste fallback content from user.');
});

test('empty state message is returned when no input text exists', () => {
  const initial = createInitialSidePanelState();
  assert.equal(getSidePanelPreviewText(initial), 'Select LinkedIn post text or paste text to continue.');
});
