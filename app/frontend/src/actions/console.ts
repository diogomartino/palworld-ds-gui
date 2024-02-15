import { consolesSliceActions } from '../store/console-slice';
import { store } from '../store';
import { TConsoleEntry } from '../types';

export const addConsoleEntry = (entry: TConsoleEntry) => {
  store.dispatch(consolesSliceActions.addConsoleEntry(entry));
};
