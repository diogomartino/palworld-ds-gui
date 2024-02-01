import { IRootState } from '../store';

export const themeSelector = (state: IRootState) => state.app.settings.theme;

export const settingsSelector = (state: IRootState) => state.app.settings;

export const loadingStatusSelector = (state: IRootState) =>
  state.app.loadingStatus;

export const latestVersionSelector = (state: IRootState) =>
  state.app.latestVersion;

export const steamImagesCacheSelector = (state: IRootState) =>
  state.app.steamImagesCache;

export const launchParamsSelector = (state: IRootState) =>
  state.app.settings.launchParams;
