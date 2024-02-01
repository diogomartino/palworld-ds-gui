import { createSlice } from '@reduxjs/toolkit';
import { LoadingStatus } from '../types';
import { saveSettings } from '../actions/app';

const getStoredSettings = () => {
  const stored = JSON.parse(localStorage.getItem('settings') || '{}');

  return {
    theme: stored.theme ?? 'dark',
    backup: {
      enabled: stored.backup?.enabled ?? false,
      intervalHours: stored.backup?.intervalHours ?? 1,
      keepCount: stored.backup?.keepCount ?? 6
    },
    launchParams:
      stored.launchParams ??
      '-useperfthreads -NoAsyncLoadingThread -UseMultithreadForDS'
  } as TSettings;
};

type TBackupSettings = {
  enabled: boolean;
  intervalHours: number;
  keepCount: number;
};

type TSettings = {
  theme: 'light' | 'dark';
  backup: TBackupSettings;
  launchParams: string | undefined;
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

      saveSettings();
    },
    setBackupSettings: (state, action) => {
      state.settings.backup = {
        ...state.settings.backup,
        ...action.payload
      };

      saveSettings();
    },
    setLatestVersion: (state, action) => {
      state.latestVersion = action.payload;
    },
    addSteamImage: (state, action) => {
      state.steamImagesCache[action.payload.steamId] = action.payload.imageUrl;
    },
    setLaunchParams: (state, action) => {
      state.settings.launchParams = action.payload;
    }
  }
});

export const appSliceActions = appSlice.actions;

export default appSlice.reducer;
