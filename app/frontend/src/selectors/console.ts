import { IRootState } from '../store';

export const consolesEntriesSelector = (state: IRootState) =>
  state.consoles.entries;
