import { useSelector } from 'react-redux';
import { serverBackupsListSelector } from '../selectors/server';

const useBackupsList = () => useSelector(serverBackupsListSelector);

export default useBackupsList;
