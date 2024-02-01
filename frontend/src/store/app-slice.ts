import { createSlice } from '@reduxjs/toolkit';
import { LoadingStatus } from '../types';

const getStoredSettings = () => {
  const stored = JSON.parse(localStorage.getItem('settings') || '{}');

  return {
    theme: stored.theme ?? 'dark',
    backup: {
      enabled: stored.backup?.enabled ?? false,
      intervalHours: stored.backup?.intervalHours ?? 1,
      keepCount: stored.backup?.keepCount ?? 6
    }
  } as TSettings;
};

const saveSettings = (settings: TSettings) => {
  localStorage.setItem('settings', JSON.stringify(settings));
};

type TBackupSettings = {
  enabled: boolean;
  intervalHours: number;
  keepCount: number;
};

type TSettings = {
  theme: 'light' | 'dark';
  backup: TBackupSettings;
};

type TSteamImageMap = {
  [steamId64: string]: string;
};

export interface IAppState {
  loadingStatus: LoadingStatus;
  settings: TSettings;
  latestVersion: string;
  steamImagesCache: TSteamImageMap;
}

const initialState: IAppState = {
  loadingStatus: LoadingStatus.IDLE,
  settings: getStoredSettings(),
  latestVersion: APP_VERSION,
  steamImagesCache: {}
};

export const appSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    setLoadingStatus: (state, action) => {
      state.loadingStatus = action.payload;
    },
    toggleTheme: (state) => {
      state.settings.theme =
        state.settings.theme === 'light' ? 'dark' : 'light';

      saveSettings(state.settings);
    },
    setBackupSettings: (state, action) => {
      state.settings.backup = {
        ...state.settings.backup,
        ...action.payload
      };

      saveSettings(state.settings);
    },
    setLatestVersion: (state, action) => {
      state.latestVersion = action.payload;
    },
    addSteamImage: (state, action) => {
      state.steamImagesCache[action.payload.steamId] = action.payload.imageUrl;
    }
  }
});

export const appSliceActions = appSlice.actions;

export default appSlice.reducer;
