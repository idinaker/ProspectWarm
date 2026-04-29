import type { SidePanelState } from '../selection/selectionWorkflow.js';
import { resolveInputText } from '../selection/selectionWorkflow.js';

export function getSidePanelPreviewText(state: SidePanelState): string {
  const resolved = resolveInputText(state);
  if (resolved.length === 0) {
    return 'Select LinkedIn post text or paste text to continue.';
  }

  return resolved;
}
