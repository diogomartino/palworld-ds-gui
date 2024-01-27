import { IRootState } from '../store';

export const themeSelector = (state: IRootState) => state.app.settings.theme;

export const loadingStatusSelector = (state: IRootState) =>
  state.app.loadingStatus;
