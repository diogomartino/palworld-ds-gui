import { createSlice } from '@reduxjs/toolkit';
import { LoadingStatus, TSettings, TSteamImageMap } from '../types';
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

export interface IAppState {
  loadingStatus: LoadingStatus;
  settings: TSettings;
  latestVersion: string;
  steamImagesCache: TSteamImageMap;
  rconCredentials: {
    host: string;
    password: string;
  };
}

const initialState: IAppState = {
  loadingStatus: LoadingStatus.IDLE,
  settings: getStoredSettings(),
  latestVersion: APP_VERSION,
  steamImagesCache: {},
  rconCredentials: {
    host: '',
    password: ''
  }
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
    },
    setLaunchParams: (state, action) => {
      state.settings.launchParams = action.payload;
    },
    setRconCredentials: (state, action) => {
      state.rconCredentials = action.payload;
    }
  }
});

export const appSliceActions = appSlice.actions;

export default appSlice.reducer;
