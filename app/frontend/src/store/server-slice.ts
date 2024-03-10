import { createSlice } from '@reduxjs/toolkit';
import { TConfig } from '../types/server-config';
import {
  ServerStatus,
  TAdditionalSettings,
  TBackup,
  TBackupSettings
} from '../types';

export interface IServerState {
  config: TConfig; // PalWorldSettings.ini
  saveName: string; // GameUserSettings.ini -> DedicatedServerName
  status: ServerStatus;
  backupsList: TBackup[];
  backupSettings: TBackupSettings;
  additionalSettings: TAdditionalSettings;
  version: string | undefined;
}

const initialState: IServerState = {
  config: {} as TConfig,
  saveName: '',
  status: ServerStatus.STOPPED,
  backupsList: [],
  backupSettings: {
    enabled: false,
    interval: 1,
    keepCount: 24
  },
  additionalSettings: {
    timedRestart: {
      enabled: false,
      interval: 4
    },
    restartOnCrash: {
      enabled: false
    }
  },
  version: undefined
};

export const serverSlice = createSlice({
  name: 'server',
  initialState,
  reducers: {
    setConfig: (state, action) => {
      state.config = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    },
    setSaveName: (state, action) => {
      state.saveName = action.payload;
    },
    clearServerState: (state) => {
      state.config = {} as TConfig;
      state.saveName = '';
      state.status = ServerStatus.STOPPED;
    },
    setBackupsList: (state, action) => {
      state.backupsList = action.payload;
    },
    setBackupSettings: (state, action) => {
      state.backupSettings = action.payload;
    },
    setAdditionalSettings: (state, action) => {
      state.additionalSettings = action.payload;
    },
    setVersion: (state, action) => {
      state.version = action.payload;
    }
  }
});

export const serverSliceActions = serverSlice.actions;

export default serverSlice.reducer;
