import { useSelector } from 'react-redux';
import { socketStateSelector } from '../selectors/socket';
import useWebSocketContext from './use-websocket-context';

const useSocket = () => {
  const { connect, disconnect } = useWebSocketContext();
  const socketData = useSelector(socketStateSelector);

  return { connect, disconnect, ...socketData };
};

export default useSocket;
