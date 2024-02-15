import WebSocket from 'ws';
import { createSlice } from '@reduxjs/toolkit';
import { TSettings, TSteamImageMap } from '../types';
import { saveSettings } from '../actions/app';

const getStoredSettings = () => {
  const stored = JSON.parse(localStorage.getItem('settings') || '{}');

  return {
    theme: stored.theme ?? 'dark',
    serverCredentials: {
      host: stored.serverCredentials?.host ?? '127.0.0.1:21577',
      apiKey: stored.serverCredentials?.apiKey ?? ''
    }
  } as TSettings;
};

export interface IAppState {
  settings: TSettings;
  latestVersion: string;
  steamImagesCache: TSteamImageMap;
  rconCredentials: {
    host: string;
    password: string;
  };
  socket: WebSocket | undefined;
  launchParams: string;
}

const initialState: IAppState = {
  socket: undefined,
  settings: getStoredSettings(),
  latestVersion: APP_VERSION,
  steamImagesCache: {},
  rconCredentials: {
    host: '',
    password: ''
  },
  launchParams: ''
};

export const appSlice = createSlice({
  name: 'modals',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.settings.theme =
        state.settings.theme === 'light' ? 'dark' : 'light';

      saveSettings(state.settings);
    },
    setServerCredentials: (state, action) => {
      state.settings.serverCredentials = action.payload;

      saveSettings(state.settings);
    },
    setLatestVersion: (state, action) => {
      state.latestVersion = action.payload;
    },
    addSteamImage: (state, action) => {
      state.steamImagesCache[action.payload.steamId] = action.payload.imageUrl;
    },
    setLaunchParams: (state, action) => {
      state.launchParams = action.payload;
    },
    setRconCredentials: (state, action) => {
      state.rconCredentials = action.payload;
    },
    setSocket: (state, action) => {
      state.socket = action.payload;
    }
  }
});

export const appSliceActions = appSlice.actions;

export default appSlice.reducer;
