import { createContext } from 'react';
import {
  clearSocket,
  onAddConsoleEntry,
  onBackupListUpdated,
  onBackupSettingsUpdated,
  onServerConfigChanged,
  onServerSaveNameChanged,
  onServerStatusChanged,
  setSocket,
  setSocketConnecting,
  setSocketError
} from '../../actions/socket';
import { SocketEvent, TSocketMessage } from '../../types';
import { ServerAPI } from '../../server';
import { clearServerState } from '../../actions/server';
import { useNavigate } from 'react-router';
import { DesktopAPI } from '../../desktop';

type TSocketProviderProps = {
  children: React.ReactNode;
};

type TContext = {
  connect: (address: string, apiKey: string) => void;
  disconnect: () => void;
};

export const WebSocketContext = createContext<TContext>({
  connect: () => {},
  disconnect: () => {}
});

const SocketProvider = ({ children }: TSocketProviderProps) => {
  const navigate = useNavigate();

  const connect = (address: string = 'localhost:21577', apiKey: string) => {
    clearServerState();
    clearSocket(true);
    setSocketConnecting(true);
    setSocketError(false);
    DesktopAPI.logToFile(`Connecting to ${address}`);

    const socketUrl = `ws://${address}/ws?auth=${apiKey}`;
    const socket = new WebSocket(socketUrl);

    const onOpen = () => {
      DesktopAPI.logToFile(`Connected to ${address}`);
      navigate('/');
      setSocket(socket);
      ServerAPI.init();
    };

    const onClose = () => {
      clearSocket();
      DesktopAPI.logToFile(`Disconnected from ${address}`);
    };

    const onError = (event: Event) => {
      setSocketError(true);
      setSocketConnecting(false);
      DesktopAPI.logToFile(`Websocket error: ${JSON.stringify(event)}`);
    };

    const onMessage = (event: MessageEvent) => {
      if (event.type === 'message') {
        const message: TSocketMessage = JSON.parse(
          event.data || '{success: false}'
        );

        if (!message.success) {
          console.error('Something went wrong', message);
        }

        switch (message.event) {
          case SocketEvent.SERVER_STATUS_CHANGED:
            onServerStatusChanged(message.data);
            break;
          case SocketEvent.SERVER_CONFIG_CHANGED:
            onServerConfigChanged(message.data);
            break;
          case SocketEvent.SERVER_SAVE_NAME_CHANGED:
            onServerSaveNameChanged(message.data);
            break;
          case SocketEvent.ADD_CONSOLE_ENTRY:
            onAddConsoleEntry(message.data);
            break;
          case SocketEvent.BACKUP_LIST_CHANGED:
            onBackupListUpdated(message.data);
            break;
          case SocketEvent.BACKUP_SETTINGS_CHANGED:
            onBackupSettingsUpdated(message.data);
            break;
          default:
            break;
        }
      }
    };

    socket.addEventListener('open', onOpen);
    socket.addEventListener('close', onClose);
    socket.addEventListener('error', onError);
    socket.addEventListener('message', onMessage);

    return () => {
      socket.removeEventListener('open', onOpen);
      socket.removeEventListener('close', onClose);
      socket.removeEventListener('error', onError);
      socket.removeEventListener('message', onMessage);
      socket.close();
    };
  };

  const disconnect = () => {
    clearSocket();
  };

  return (
    <WebSocketContext.Provider
      value={{
        connect,
        disconnect
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export default SocketProvider;
