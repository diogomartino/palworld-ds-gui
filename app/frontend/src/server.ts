import { SocketAction, TAdditionalSettings, TGenericObject } from './types';
import { parseConfig, serializeConfig } from './helpers/config-parser';
import { setConfig, setSaveName } from './actions/server';
import { ConfigKey, TConfig } from './types/server-config';
import { store } from './store';
import { addSteamImage, notifyError, notifySuccess } from './actions/app';
import { socketStateSelector } from './selectors/socket';
import {
  onBackupListUpdated,
  onBackupSettingsUpdated,
  onClientInited
} from './actions/socket';
import { DesktopAPI } from './desktop';
import { RconCommand, TRconInfo, TRconPlayer } from './types/rcon';
import { serverConfigSelector } from './selectors/server';

const TIMEOUT_MS = 10000;

export const ServerAPI = {
  send: async (
    event: SocketAction,
    data?: TGenericObject,
    waitForResponse = true
  ): Promise<TGenericObject> => {
    return new Promise((resolve, reject) => {
      const state = store.getState();
      const { socket } = socketStateSelector(state);
      let timeoutId: NodeJS.Timeout | undefined = undefined;

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
            clearTimeout(timeoutId);
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

        timeoutId = setTimeout(() => {
          socket.removeEventListener('message', onMessage);
          reject(new Error(`Request timed out for event: ${event}`));
        }, TIMEOUT_MS);

        socket.addEventListener('message', onMessage);
      } catch (error) {
        clearTimeout(timeoutId);
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
  },
  writeConfig: async (config: TConfig) => {
    try {
      const serializedConfig = serializeConfig(config);
      await ServerAPI.send(SocketAction.WRITE_CONFIG, {
        config: serializedConfig
      });
    } catch {
      notifyError('Could not save config');
    }
  },
  fetchSaveName: async () => {
    const { data: saveNameString } = await ServerAPI.send(
      SocketAction.READ_SAVE_NAME
    );

    setSaveName(saveNameString);
  },
  writeSaveName: async (saveName: string) => {
    try {
      await ServerAPI.send(SocketAction.WRITE_SAVE_NAME, { saveName });
    } catch {
      notifyError('Could not save save name');
    }
  },
  start: async () => {
    ServerAPI.send(SocketAction.START_SERVER, undefined, false);
  },
  stop: () => {
    ServerAPI.send(SocketAction.STOP_SERVER, undefined, false);
  },
  restart: () => {
    ServerAPI.send(SocketAction.RESTART_SERVER, undefined, false);
  },
  update: () => {
    ServerAPI.send(SocketAction.UPDATE_SERVER, undefined, false);
  },
  init: async () => {
    const { data } = await ServerAPI.send(SocketAction.INIT);

    onClientInited(data);
  },
  saveLaunchParams: async (launchParams: string) => {
    try {
      await ServerAPI.send(SocketAction.SAVE_LAUNCH_PARAMS, { launchParams });
      notifySuccess('Launch params saved');
    } catch {
      notifyError('Could not save launch params');
    }
  },
  saveAdditionalSettings: async (newSettings: TAdditionalSettings) => {
    try {
      await ServerAPI.send(SocketAction.SAVE_ADDITIONAL_SETTINGS, {
        newSettings
      });

      notifySuccess('Additional settings saved');
    } catch {
      notifyError('Could not save additional settings');
    }
  },
  utils: {
    getProfileAvatarURL: async (steamID64: string) => {
      const { data: avatarUrl } = await ServerAPI.send(
        SocketAction.GET_STEAM_AVATAR,
        {
          steamID64
        }
      );

      addSteamImage(steamID64, avatarUrl);
    }
  },
  backups: {
    start: async (interval: number, keepCount: number) => {
      try {
        await ServerAPI.send(SocketAction.START_BACKUPS, {
          interval,
          keepCount
        });
        notifySuccess('Backups are now enabled');
      } catch {
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
  },
  rcon: {
    execute: async (command: string) => {
      const state = store.getState();
      const serverConfig = serverConfigSelector(state);

      const { data: result } = await ServerAPI.send(SocketAction.RCON_EXECUTE, {
        hostname: `127.0.0.1:${serverConfig[ConfigKey.RCONPort]}`,
        password: serverConfig[ConfigKey.AdminPassword],
        command
      });

      return (result ?? '').trim();
    },
    getInfo: async (): Promise<TRconInfo | undefined> => {
      try {
        const result = (
          (await ServerAPI.rcon.execute(RconCommand.INFO)) || ''
        ).trim();

        const regex = /Welcome to Pal Server\[(.*?)\]\s*(.*)/;
        const match = result.match(regex);
        const [, version, name] = match || [];

        return {
          version,
          name
        };
      } catch (err) {
        //
        console.error('! getInfo error', err);
      }

      return undefined;
    },
    getPlayers: async (): Promise<TRconPlayer[]> => {
      try {
        const result = (
          (await ServerAPI.rcon.execute(RconCommand.SHOW_PLAYERS)) || ''
        ).trim();

        const lines = result.split('\n');

        lines.shift(); // remove the first line which is the header

        const players = lines.map((line) => {
          const [name, uid, steamId] = line.split(',').map((s) => s.trim());
          const player: TRconPlayer = {
            name,
            uid,
            steamId
          };

          ServerAPI.utils.getProfileAvatarURL(steamId); // crawl steam profile image and cache the url in the store so we don't have to do it again for the same player

          return player;
        });

        return players;
      } catch {
        //
      }

      return [];
    },
    save: async () => {
      await ServerAPI.rcon.execute(RconCommand.SAVE);
    },
    shutdown: async (
      message: string = 'Server is being shutdown',
      seconds?: number
    ) => {
      const command = `${RconCommand.SHUTDOWN} ${seconds ?? 1} ${message}`;

      await ServerAPI.rcon.execute(command);
    },
    sendMessage: async (messages: string) => {
      const command = `${RconCommand.BROADCAST} ${messages}`;

      await ServerAPI.rcon.execute(command);
    },
    ban: async (uid: string) => {
      const command = `${RconCommand.BAN} ${uid}`;

      await ServerAPI.rcon.execute(command);
    },
    kick: async (uid: string) => {
      const command = `${RconCommand.KICK} ${uid}`;

      await ServerAPI.rcon.execute(command);
    }
  }
};
