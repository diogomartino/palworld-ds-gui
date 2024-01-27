import Routing from '../routing';
import useEventsInit from '../../hooks/use-events-init';
import useLoadingStatus from '../../hooks/use-loading-status';
import { LoadingStatus } from '../../types';
import Initializing from '../../screens/initializing';
import useTheme from '../../hooks/use-theme';

const App = () => {
  useEventsInit();
  useTheme();

  const loadingStatus = useLoadingStatus();

  if (loadingStatus !== LoadingStatus.DONE) {
    return <Initializing />;
  }

  return <Routing />;
};

export default App;
