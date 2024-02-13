import { SocketAction, TGenericObject } from './types';
import { parseConfig, serializeConfig } from './helpers/config-parser';
import { setConfig, setSaveName } from './actions/server';
import { ConfigKey, TConfig } from './types/server-config';
import { store } from './store';
import {
  notifyError,
  notifySuccess,
  saveSettings,
  setRconCredentials
} from './actions/app';
import { socketStateSelector } from './selectors/socket';
import {
  onBackupListUpdated,
  onBackupSettingsUpdated,
  onClientInited
} from './actions/socket';
import { DesktopAPI } from './desktop';

export const ServerAPI = {
  send: async (
    event: SocketAction,
    data?: TGenericObject,
    waitForResponse = true
  ): Promise<TGenericObject> => {
    return new Promise((resolve, reject) => {
      const state = store.getState();
      const { socket } = socketStateSelector(state);

      // TODO: add timeout

      try {
        const eventId = Math.random().toString(36).substring(2);

        socket.send(JSON.stringify({ event, eventId, data }));

        if (!waitForResponse) {
          resolve({});
          return;
        }

        const onMessage = (event) => {
          const response = JSON.parse(event.data);

          if (response.eventId === eventId) {
            socket.removeEventListener('message', onMessage);

            delete response.eventId;
            delete response.event;

            if (response.success) {
              resolve(response);
            } else {
              DesktopAPI.logToFile(
                `Socket responded with error: ${response.error} for event: ${event} and data: ${data}`
              );
              reject(response.error ?? 'Unknown error');
            }
          }
        };

        socket.addEventListener('message', onMessage);
      } catch (error) {
        DesktopAPI.logToFile('Unknown error while handling socket event');
        reject(error ?? 'Unknown error');
      }
    });
  },
  fetchConfig: async () => {
    const { data: configString } = await ServerAPI.send(
      SocketAction.READ_CONFIG
    );
    const config = parseConfig(configString);

    setConfig(config);
    setRconCredentials(
      `127.0.0.1:${config[ConfigKey.RCONPort]}`,
      config[ConfigKey.AdminPassword]
    );
  },
  writeConfig: async (config: TConfig) => {
    const serializedConfig = serializeConfig(config);
    await ServerAPI.send(SocketAction.WRITE_CONFIG, {
      config: serializedConfig
    });

    // // Read again to confirm and update the store
    // await ServerAPI.fetchConfig();
  },
  fetchSaveName: async () => {
    const { data: saveNameString } = await ServerAPI.send(
      SocketAction.READ_SAVE_NAME
    );

    setSaveName(saveNameString);
  },
  writeSaveName: async (saveName: string) => {
    await ServerAPI.send(SocketAction.WRITE_SAVE_NAME, { saveName });

    // Read again to confirm and update the store
    await ServerAPI.fetchSaveName();
  },
  start: async () => {
    ServerAPI.send(SocketAction.START_SERVER);
    saveSettings();
  },
  stop: () => {
    ServerAPI.send(SocketAction.STOP_SERVER);
  },
  restart: () => {
    ServerAPI.send(SocketAction.RESTART_SERVER);
  },
  update: () => {
    ServerAPI.send(SocketAction.UPDATE_SERVER);
  },
  init: async () => {
    const { data } = await ServerAPI.send(SocketAction.INIT);

    onClientInited(data);
  },
  backups: {
    start: async (interval: number, keepCount: number) => {
      try {
        await ServerAPI.send(SocketAction.START_BACKUPS, {
          interval,
          keepCount
        });
        notifySuccess('Backups are now enabled');
      } catch (error) {
        notifyError('Could not start backups');
      }
    },
    stop: async () => {
      try {
        await ServerAPI.send(SocketAction.STOP_BACKUPS);
        notifySuccess('Backups are now disabled');
      } catch {
        notifyError('Could not stop backups');
      }
    },
    fetchCurrentSettings: async () => {
      const { data } = await ServerAPI.send(SocketAction.GET_BACKUPS_SETTINGS);

      onBackupSettingsUpdated(data);
    },
    fetchList: async () => {
      const { data } = await ServerAPI.send(SocketAction.GET_BACKUPS_LIST);

      onBackupListUpdated(data);
    },
    delete: async (backupFileName: string) => {
      try {
        await ServerAPI.send(SocketAction.DELETE_BACKUP, { backupFileName });
        notifySuccess('Backup deleted');
      } catch {
        notifyError('Could not delete backup');
      }
    },
    create: async () => {
      try {
        await ServerAPI.send(SocketAction.CREATE_BACKUP);
        notifySuccess('Backup created');
      } catch {
        notifyError('Could not create backup');
      }
    },
    restore: async (backupFileName: string) => {
      try {
        await ServerAPI.send(SocketAction.RESTORE_BACKUP, { backupFileName });
        notifySuccess('Backup restored');
      } catch {
        notifyError('Could not restore backup');
      }
    }
  }
};
