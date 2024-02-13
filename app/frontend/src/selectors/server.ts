import { IRootState } from '../store';

export const serverConfigSelector = (state: IRootState) => state.server.config;

export const serverStatusSelector = (state: IRootState) => state.server.status;

export const serverSaveNameSelector = (state: IRootState) =>
  state.server.saveName;

export const serverBackupsListSelector = (state: IRootState) =>
  state.server.backupsList;

export const backupSetingsSelector = (state: IRootState) =>
  state.server.backupSettings;
