import { IRootState } from '../store';

export const serverConfigSelector = (state: IRootState) => state.server.config;

export const serverStatusSelector = (state: IRootState) => state.server.status;

export const serverSaveNameSelector = (state: IRootState) =>
  state.server.saveName;
