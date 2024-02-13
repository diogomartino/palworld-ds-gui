import { createSlice } from '@reduxjs/toolkit';
import { TConsoleEntry } from '../types';

export interface IConsoleSlice {
  entries: TConsoleEntry[];
}

const initialState: IConsoleSlice = {
  entries: []
};

export const consoleSlice = createSlice({
  name: 'consoles',
  initialState,
  reducers: {
    addConsoleEntry: (state, action) => {
      state.entries.push(action.payload);
    },
    clearConsole: (state) => {
      state.entries = [];
    }
  }
});

export const consolesSliceActions = consoleSlice.actions;

export default consoleSlice.reducer;
