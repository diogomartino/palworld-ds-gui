import { IRootState } from '../store';
import { ConsoleId, TConsoleEntry } from '../types';

export const consolesByIdSelector = (
  state: IRootState,
  consoleIds: ConsoleId[]
) => {
  const result: TConsoleEntry[] = [];

  consoleIds.forEach((consoleId) => {
    if (state.consoles[consoleId]) {
      result.push(...state.consoles[consoleId]);
    }
  });

  // sort by timestamp
  result.sort((a, b) => a.timestamp - b.timestamp);

  return result;
};
