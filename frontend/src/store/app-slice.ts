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

export interface IAppState {
  loadingStatus: LoadingStatus;
  settings: TSettings;
}

const initialState: IAppState = {
  loadingStatus: LoadingStatus.IDLE,
  settings: getStoredSettings()
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
    }
  }
});

export const appSliceActions = appSlice.actions;

export default appSlice.reducer;
