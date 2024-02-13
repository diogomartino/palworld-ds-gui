import { useContext } from 'react';
import { WebSocketContext } from '../components/socket-provider';

const useWebSocketContext = () => {
  return useContext(WebSocketContext);
};

export default useWebSocketContext;
