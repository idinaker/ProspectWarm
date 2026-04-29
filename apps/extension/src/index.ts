export {
  applyPasteFallback,
  applySelectionToState,
  captureSelectedText,
  createInitialSidePanelState,
  normalizeUserText,
  resolveInputText
} from './selection/selectionWorkflow.js';
export { extractSelectedTextFromMockPage } from './selection/mockPageSelection.js';
export { getSidePanelPreviewText } from './sidepanel/presenter.js';

export { buildPromptInput } from './profile/buildPromptInput.js';
export type { UserProfileContext } from './profile/types.js';
export { loadProfileContext, saveProfileContext } from './storage/profileContextStorage.js';
