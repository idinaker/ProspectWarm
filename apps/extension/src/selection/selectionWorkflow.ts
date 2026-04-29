export interface SidePanelState {
  selectedText: string;
  pastedText: string;
}

export function createInitialSidePanelState(): SidePanelState {
  return {
    selectedText: '',
    pastedText: ''
  };
}

export function normalizeUserText(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

export function captureSelectedText(rawSelection: string | null | undefined): string {
  if (!rawSelection) {
    return '';
  }

  return normalizeUserText(rawSelection);
}

export function applySelectionToState(
  state: SidePanelState,
  rawSelection: string | null | undefined
): SidePanelState {
  return {
    ...state,
    selectedText: captureSelectedText(rawSelection)
  };
}

export function applyPasteFallback(state: SidePanelState, pastedText: string): SidePanelState {
  return {
    ...state,
    pastedText: normalizeUserText(pastedText)
  };
}

export function resolveInputText(state: SidePanelState): string {
  if (state.selectedText.length > 0) {
    return state.selectedText;
  }

  return state.pastedText;
}
