import { serverSliceActions } from '../store/server-slice';
import { store } from '../store';
import { ConfigKey, TConfig } from '../types/server-config';
import { ServerStatus } from '../types';
import { consolesSliceActions } from '../store/console-slice';
import { rconCredentialsSelector } from '../selectors/app';
import { setRconCredentials } from './app';

export const setConfig = (config: TConfig) => {
  const state = store.getState();
  const rconCredentials = rconCredentialsSelector(state);

  // auto fill rcon credentials if they are not set
  if (!rconCredentials.host && !rconCredentials.password) {
    setRconCredentials(
      `127.0.0.1:${config[ConfigKey.RCONPort]}`,
      config[ConfigKey.AdminPassword]
    );
  }

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
