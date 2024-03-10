import { appSliceActions } from '../store/app-slice';
import { store } from '../store';
import { TAdditionalSettings, TSettings } from '../types';
import { settingsSelector } from '../selectors/app';
import { ServerAPI } from '../server';
import { serverSliceActions } from '../store/server-slice';
import { toast } from 'react-toastify';

export const toggleTheme = () => {
  store.dispatch(appSliceActions.toggleTheme());
};

export const setLaunchParams = (launchParams: string) => {
  store.dispatch(appSliceActions.setLaunchParams(launchParams ?? ''));
};

export const setServerCredentials = (host: string, apiKey: string) => {
  store.dispatch(appSliceActions.setServerCredentials({ host, apiKey }));
};

export const saveSettings = (settings?: TSettings) => {
  let targetSettings;

  if (settings) {
    targetSettings = settings;
  } else {
    // only get the settings from the store if it's not passed as an argument so we can call this function from the store
    const state = store.getState();
    targetSettings = settingsSelector(state);
  }

  localStorage.setItem('settings', JSON.stringify(targetSettings));
};

export const changeBackupSettings = async (
  enabled: boolean,
  interval: number,
  keepCount: number
) => {
  if (enabled) {
    await ServerAPI.backups.start(+interval, +keepCount);
  } else {
    await ServerAPI.backups.stop();
  }

  store.dispatch(
    serverSliceActions.setBackupSettings({
      enabled,
      interval,
      keepCount
    })
  );
};

export const saveAdditionalSettings = async (
  newSettings: TAdditionalSettings
) => {
  // convert types to make sure
  await ServerAPI.saveAdditionalSettings({
    timedRestart: {
      enabled: Boolean(newSettings.timedRestart.enabled),
      interval: +newSettings.timedRestart.interval
    },
    restartOnCrash: {
      enabled: Boolean(newSettings.restartOnCrash.enabled)
    }
  });

  store.dispatch(serverSliceActions.setAdditionalSettings(newSettings));
};

export const checkForUpdates = async () => {
  try {
    const response = await fetch(
      'https://api.github.com/repos/diogomartino/palworld-ds-gui/releases/latest'
    );

    const data = await response.json();
    const latestVersion = data.tag_name.replace('v', '');

    if (latestVersion !== APP_VERSION) {
      store.dispatch(appSliceActions.setLatestVersion(latestVersion));
    }
  } catch (error) {
    store.dispatch(appSliceActions.setLatestVersion(APP_VERSION));
    console.error(error);
  }
};

export const addSteamImage = (steamId: string, imageUrl: string) => {
  store.dispatch(appSliceActions.addSteamImage({ steamId, imageUrl }));
};

export const notifyError = (message: string) => {
  toast(message, { type: 'error' });
};

export const notifySuccess = (message: string) => {
  toast(message, { type: 'success', autoClose: 2000 });
};
