import { createSlice } from '@reduxjs/toolkit';
import { TConfig } from '../types/server-config';
import { ServerStatus, TBackup, TBackupSettings } from '../types';

export interface IServerState {
  config: TConfig; // PalWorldSettings.ini
  saveName: string; // GameUserSettings.ini -> DedicatedServerName
  status: ServerStatus;
  backupsList: TBackup[];
  backupSettings: TBackupSettings;
}

const initialState: IServerState = {
  config: {} as TConfig,
  saveName: '',
  status: ServerStatus.STOPPED,
  backupsList: [],
  backupSettings: {
    enabled: false,
    intervalHours: 1,
    keepCount: 24
  }
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
    }
  }
});

export const serverSliceActions = serverSlice.actions;

export default serverSlice.reducer;
