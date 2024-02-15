import { useSelector } from 'react-redux';
import { latestVersionSelector } from '../selectors/app';

const useHasUpdates = () => {
  const latestVersion = useSelector(latestVersionSelector);
  const hasUpdates = latestVersion !== APP_VERSION;

  return { hasUpdates, latestVersion };
};

export default useHasUpdates;
