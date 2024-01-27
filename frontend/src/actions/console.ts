import { consolesSliceActions } from '../store/console-slice';
import { store } from '../store';
import { ConsoleId, TConsoleEntry } from '../types';

export const addConsoleEntry = (consoleId: ConsoleId, entry: TConsoleEntry) => {
  store.dispatch(consolesSliceActions.addConsoleEntry({ consoleId, entry }));
};
