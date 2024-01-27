import { createSlice } from '@reduxjs/toolkit';
import { TConfig } from '../types/server-config';
import { ServerStatus } from '../types';

export interface IServerState {
  config: TConfig;
  status: ServerStatus;
}

const initialState: IServerState = {
  config: {} as TConfig,
  status: ServerStatus.STOPPED
};

export const serverSlice = createSlice({
  name: 'server',
  initialState,
  reducers: {
    setConfig: (state, action) => {
      state.config = action.payload;
    },
    setStatus: (state, action) => {
      state.status = action.payload;
    }
  }
});

export const serverSliceActions = serverSlice.actions;

export default serverSlice.reducer;
