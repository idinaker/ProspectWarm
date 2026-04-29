const START_MARKER = '<!-- SELECT_START -->';
const END_MARKER = '<!-- SELECT_END -->';

export function extractSelectedTextFromMockPage(markup: string): string {
  const start = markup.indexOf(START_MARKER);
  const end = markup.indexOf(END_MARKER);

  if (start === -1 || end === -1 || end <= start) {
    return '';
  }

  const raw = markup.slice(start + START_MARKER.length, end);
  return raw.replace(/\s+/g, ' ').trim();
}
