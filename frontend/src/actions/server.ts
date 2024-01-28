import { serverSliceActions } from '../store/server-slice';
import { store } from '../store';
import { TConfig } from '../types/server-config';
import { ServerStatus } from '../types';
import { DesktopApi } from '../desktop';

export const setConfig = (config: TConfig) => {
  store.dispatch(serverSliceActions.setConfig(config));
};

export const setStatus = (status: ServerStatus) => {
  store.dispatch(serverSliceActions.setStatus(status));
};

export const startServer = async () => {
  await DesktopApi.server.start();
};

export const stopServer = async () => {
  await DesktopApi.server.stop();
};

export const restartServer = async () => {
  await DesktopApi.server.restart();
};

export const updateServer = async () => {
  await DesktopApi.server.update();
};
