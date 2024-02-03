import { appSliceActions } from '../store/app-slice';
import { store } from '../store';
import { LoadingStatus, TSettings } from '../types';
import { DesktopApi } from '../desktop';
import { settingsSelector, steamImagesCacheSelector } from '../selectors/app';

export const setLoadingStatus = (loadingStatus: LoadingStatus) => {
  store.dispatch(appSliceActions.setLoadingStatus(loadingStatus));
};

export const toggleTheme = () => {
  store.dispatch(appSliceActions.toggleTheme());
};

export const setLaunchParams = (launchParams: string) => {
  store.dispatch(appSliceActions.setLaunchParams(launchParams ?? ''));
};

export const setRconCredentials = (host: string, password: string) => {
  store.dispatch(appSliceActions.setRconCredentials({ host, password }));
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

export const initApp = async () => {
  const state = store.getState();
  const { backup } = settingsSelector(state);

  await DesktopApi.server.readConfig();
  await DesktopApi.server.readSaveName();

  if (backup.enabled) {
    await DesktopApi.backups.start(backup.intervalHours, backup.keepCount);
  }
};

export const changeBackupSettings = (
  enabled: boolean,
  intervalHours: number,
  keepCount: number
) => {
  if (enabled) {
    DesktopApi.backups.start(+intervalHours, +keepCount);
  } else {
    DesktopApi.backups.stop();
  }

  store.dispatch(
    appSliceActions.setBackupSettings({
      enabled,
      intervalHours,
      keepCount
    })
  );
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

export const cacheSteamImage = async (steamId: string) => {
  const state = store.getState();
  const steamCache = steamImagesCacheSelector(state);

  if (steamCache[steamId]) {
    return;
  }

  DesktopApi.getProfileImageURL(steamId);
};
