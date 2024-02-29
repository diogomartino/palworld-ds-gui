import { useSelector } from 'react-redux';
import { timedRestartSettingsSelector } from '../selectors/server';

export const useTimedRestartSettings = () =>
  useSelector(timedRestartSettingsSelector);

export default useTimedRestartSettings;
