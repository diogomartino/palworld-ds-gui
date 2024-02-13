import Routing from '../routing';
import useEventsInit from '../../hooks/use-events-init';
import Initializing from '../../screens/initializing';
import useTheme from '../../hooks/use-theme';
import useSocket from '../../hooks/use-socket';

const App = () => {
  useEventsInit();
  useTheme();

  const { socket, inited } = useSocket();

  if (!socket || socket.readyState !== WebSocket.OPEN || !inited) {
    return <Initializing />;
  }

  return <Routing />;
};

export default App;
