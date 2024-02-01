import { appSliceActions } from '../store/app-slice';
import { store } from '../store';
import { LoadingStatus } from '../types';
import { DesktopApi } from '../desktop';
import { settingsSelector } from '../selectors/app';

export const setLoadingStatus = (loadingStatus: LoadingStatus) => {
  store.dispatch(appSliceActions.setLoadingStatus(loadingStatus));
};

export const toggleTheme = () => {
  store.dispatch(appSliceActions.toggleTheme());
};

export const setLaunchParams = (launchParams: string) => {
  store.dispatch(appSliceActions.setLaunchParams(launchParams ?? ''));
};

export const saveSettings = () => {
  const state = store.getState();
  const settings = settingsSelector(state);

  localStorage.setItem('settings', JSON.stringify(settings));
};

export const initApp = () => {
  const state = store.getState();
  const { backup } = settingsSelector(state);

  DesktopApi.server.readConfig();
  DesktopApi.server.readSaveName();

  if (backup.enabled) {
    DesktopApi.backups.start(backup.intervalHours, backup.keepCount);
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
