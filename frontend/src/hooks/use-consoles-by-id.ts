import { useSelector } from 'react-redux';
import { ConsoleId } from '../types';
import { consolesByIdSelector } from '../selectors/console';

const useConsolesById = (ids: ConsoleId[]) =>
  useSelector((state: any) => consolesByIdSelector(state, ids));

export default useConsolesById;
