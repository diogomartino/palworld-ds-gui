import { socketSliceActions } from '../store/socket-slice';
import { serverSliceActions } from '../store/server-slice';
import { store } from '../store';
import {
  ServerStatus,
  TBackup,
  TBackupSettings,
  TClientInitedData,
  TConsoleEntry
} from '../types';
import { fetchServerInfo, setLaunchParams } from './app';
import { setBackupsList, setConfig, setSaveName, setStatus } from './server';
import { parseConfig } from '../helpers/config-parser';
import { addConsoleEntry } from './console';

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

  addConsoleEntry(entry);
};

export const onClientInited = (data: TClientInitedData) => {
  setStatus(data.currentServerStatus);
  setLaunchParams(data.currentLaunchParams);
  setSocketInited(true);
  setSocketConnecting(false);
  fetchServerInfo();
};

export const onBackupListUpdated = (data) => {
  const backups: TBackup[] = data.map((backup) => ({
    fileName: backup.Filename,
    saveName: backup.SaveName,
    size: backup.Size,
    timestamp: backup.Timestamp
  }));

  setBackupsList(backups);
};

export const onBackupSettingsUpdated = (data) => {
  const backupsSettings: TBackupSettings = {
    enabled: data.Enabled,
    intervalHours: data.Interval,
    keepCount: data.KeepCount
  };

  store.dispatch(serverSliceActions.setBackupSettings(backupsSettings));
};

export const onLaunchParamsChanged = (launchParams: string) => {
  setLaunchParams(launchParams);
};

export const onServerConfigChanged = (configStr: string) => {
  const config = parseConfig(configStr);

  setConfig(config);
};

export const onServerSaveNameChanged = (saveName: string) => {
  setSaveName(saveName);
};
