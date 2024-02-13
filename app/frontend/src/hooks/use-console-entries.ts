import { useSelector } from 'react-redux';
import { consolesEntriesSelector } from '../selectors/console';

const useConsoleEntries = () =>
  useSelector((state: any) => consolesEntriesSelector(state));

export default useConsoleEntries;
