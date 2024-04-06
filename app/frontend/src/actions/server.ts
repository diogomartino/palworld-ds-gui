import { serverSliceActions } from '../store/server-slice';
import { store } from '../store';
import { ConfigKey, TConfig, configTypes } from '../types/server-config';
import { ServerStatus } from '../types';
import { consolesSliceActions } from '../store/console-slice';

export const setConfig = (config: TConfig) => {
  const allConfigKeys = Object.keys(ConfigKey);
  const mergedConfig = allConfigKeys.reduce((acc, key) => {
    if (config[key]) {
      acc[key] = config[key];
    } else {
      const type = configTypes[key];

      if (type === 'boolean') {
        acc[key] = false;
      } else {
        acc[key] = '';
      }
    }

    return acc;
  }, {} as TConfig); // merge config keys that might not exist in the incoming config (eg: new config keys for a new server version)

  store.dispatch(serverSliceActions.setConfig(mergedConfig));
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
