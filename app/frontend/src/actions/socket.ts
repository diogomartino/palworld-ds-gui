import { socketSliceActions } from '../store/socket-slice';
import { serverSliceActions } from '../store/server-slice';
import { store } from '../store';
import {
  Modal,
  ServerStatus,
  TAdditionalSettings,
  TBackup,
  TBackupSettings,
  TClientInitedData,
  TConsoleEntry
} from '../types';
import { setLaunchParams } from './app';
import {
  setBackupsList,
  setConfig,
  setSaveName,
  setServerVersion
} from './server';
import { parseConfig } from '../helpers/config-parser';
import { addConsoleEntry } from './console';
import { openModal } from './modal';

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
  onServerStatusChanged(data.currentServerStatus);
  onLaunchParamsChanged(data.currentLaunchParams);
  onServerConfigChanged(data.currentConfig);
  onServerSaveNameChanged(data.currentSaveName);
  onBackupSettingsUpdated(data.currentBackupsSettings);
  onAdditionalSettingsUpdated(data.currentAdditionalSettings);
  onBackupListUpdated(data.currentBackupsList);

  setServerVersion(data.serverVersion);
  setSocketInited(true);
  setSocketConnecting(false);

  if (data.serverVersion !== APP_VERSION) {
    openModal(Modal.VERSION_MISMATCH, {
      clientVersion: APP_VERSION,
      serverVersion: data.serverVersion
    });
  }
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
    interval: data.Interval,
    keepCount: data.KeepCount
  };

  store.dispatch(serverSliceActions.setBackupSettings(backupsSettings));
};

export const onAdditionalSettingsUpdated = (data) => {
  const additionalSettings: TAdditionalSettings = {
    timedRestart: {
      enabled: data.timedRestart.Enabled,
      interval: data.timedRestart.Interval
    },
    restartOnCrash: {
      enabled: data.restartOnCrash.Enabled
    }
  };

  store.dispatch(serverSliceActions.setAdditionalSettings(additionalSettings));
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
