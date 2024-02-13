import { useSelector } from 'react-redux';
import { backupSetingsSelector } from '../selectors/server';

export const useBackupSettings = () => useSelector(backupSetingsSelector);

export default useBackupSettings;
