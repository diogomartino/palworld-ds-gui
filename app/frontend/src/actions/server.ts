import { serverSliceActions } from '../store/server-slice';
import { store } from '../store';
import { TConfig } from '../types/server-config';
import { ServerStatus } from '../types';
import { consolesSliceActions } from '../store/console-slice';

export const setConfig = (config: TConfig) => {
  store.dispatch(serverSliceActions.setConfig(config));
};

export const setSaveName = (saveName: string) => {
  store.dispatch(serverSliceActions.setSaveName(saveName));
};

export const setStatus = (status: ServerStatus) => {
  store.dispatch(serverSliceActions.setStatus(status));
};

export const clearServerState = () => {
  store.dispatch(serverSliceActions.clearServerState());
  store.dispatch(consolesSliceActions.clearConsole());
};

export const setBackupsList = (backupsList: any) => {
  store.dispatch(serverSliceActions.setBackupsList(backupsList));
};

export const setServerVersion = (version: string) => {
  store.dispatch(serverSliceActions.setVersion(version));
};
