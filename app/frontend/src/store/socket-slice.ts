import WebSocket from 'ws';
import { createSlice } from '@reduxjs/toolkit';

export interface ISocketState {
  socket: WebSocket | undefined;
  connecting: boolean;
  inited: boolean;
  error: string | undefined | boolean;
}

const initialState: ISocketState = {
  socket: undefined,
  connecting: false,
  inited: false,
  error: undefined
};

export const socketSlice = createSlice({
  name: 'socket',
  initialState,
  reducers: {
    setSocket: (state, action) => {
      state.error = undefined;
      state.socket = action.payload;
    },
    setConnecting: (state, action) => {
      state.connecting = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
    },
    setInited: (state, action) => {
      state.inited = action.payload;
    },
    clear: (state) => {
      state.socket?.close();
      state.socket = undefined;
      state.connecting = false;
      state.inited = false;
    }
  }
});

export const socketSliceActions = socketSlice.actions;

export default socketSlice.reducer;
