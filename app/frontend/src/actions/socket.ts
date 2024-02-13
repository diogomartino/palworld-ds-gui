import { socketSliceActions } from '../store/socket-slice';
import { serverSliceActions } from '../store/server-slice';
import { store } from '../store';
import {
  ServerStatus,
  TBackup,
  TBackupSettings,
  TConsoleEntry
} from '../types';
import { consolesSliceActions } from '../store/console-slice';
import { initApp } from './app';
import { setStatus } from './server';
import { parseConfig } from '../helpers/config-parser';

export const setSocket = (socket: WebSocket) => {
  store.dispatch(socketSliceActions.setSocket(socket));
};

export const setSocketConnecting = (connecting: boolean) => {
  store.dispatch(socketSliceActions.setConnecting(connecting));
};

export const setSocketError = (error: string | boolean) => {
  store.dispatch(socketSliceActions.setError(error));
};

export const setSocketInited = (inited: boolean) => {
  store.dispatch(socketSliceActions.setInited(inited));
};

export const clearSocket = (clearError = false) => {
  store.dispatch(socketSliceActions.clear());

  if (clearError) {
    store.dispatch(socketSliceActions.setError(undefined));
  }
};

export const onErrorReceived = (error: string) => {
  store.dispatch(socketSliceActions.setError(error));
};

export const onServerStatusChanged = (data: ServerStatus) => {
  store.dispatch(serverSliceActions.setStatus(data));
};

export const onAddConsoleEntry = (message: string) => {
  const entry: TConsoleEntry = {
    message,
    msgType: 'stdout',
    timestamp: Date.now()
  };

  store.dispatch(consolesSliceActions.addConsoleEntry(entry));
};

export const onClientInited = (data) => {
  setStatus(data);
  setSocketInited(true);
  setSocketConnecting(false);
  initApp();
};

export const onBackupListUpdated = (data) => {
  const backups: TBackup[] = data.map((backup) => ({
    fileName: backup.Filename,
    saveName: backup.SaveName,
    size: backup.Size,
    timestamp: backup.Timestamp
  }));

  store.dispatch(serverSliceActions.setBackupsList(backups));
};

export const onBackupSettingsUpdated = (data) => {
  const backupsSettings: TBackupSettings = {
    enabled: data.Enabled,
    intervalHours: data.Interval,
    keepCount: data.KeepCount
  };

  store.dispatch(serverSliceActions.setBackupSettings(backupsSettings));
};

export const onServerConfigChanged = (configStr: string) => {
  const config = parseConfig(configStr);

  store.dispatch(serverSliceActions.setConfig(config));
};

export const onServerSaveNameChanged = (saveName: string) => {
  store.dispatch(serverSliceActions.setSaveName(saveName));
};
