import { useSelector } from 'react-redux';
import { additionalSettingsSelector } from '../selectors/server';

export const useAdditionalSettings = () =>
  useSelector(additionalSettingsSelector);

export default useAdditionalSettings;
