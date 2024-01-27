import { createSlice } from '@reduxjs/toolkit';
import { TConsoleEntry } from '../types';

export interface IConsoleSlice {
  [consoleId: string]: TConsoleEntry[];
}

const initialState: IConsoleSlice = {};

export const consoleSlice = createSlice({
  name: 'consoles',
  initialState,
  reducers: {
    addConsoleEntry: (state, action) => {
      console.log('! addConsoleEntry', action.payload);

      if (!state[action.payload.consoleId]) {
        state[action.payload.consoleId] = [];
      }

      state[action.payload.consoleId].push(action.payload.entry);
    },
    clearConsole: (state, action) => {
      state[action.payload] = [];
    }
  }
});

export const consolesSliceActions = consoleSlice.actions;

export default consoleSlice.reducer;
