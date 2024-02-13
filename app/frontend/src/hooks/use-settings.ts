import { useSelector } from 'react-redux';
import { settingsSelector } from '../selectors/app';

export const useSettings = () => useSelector(settingsSelector);

export default useSettings;
