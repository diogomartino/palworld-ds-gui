import { AppEvent, TGenericFunction } from './types';
import { EventsOff, EventsOn } from './wailsjs/runtime/runtime';
import * as DedicatedServer from './wailsjs/go/dedicatedserver/DedicatedServer';
import * as BackupManager from './wailsjs/go/backupsmanager/BackupManager';
import * as RconClient from './wailsjs/go/rconclient/RconClient';
import * as App from './wailsjs/go/main/App';
import { parseConfig, serializeConfig } from './helpers/config-parser';
import { setConfig, setSaveName } from './actions/server';
import { ConfigKey, TConfig } from './types/server-config';
import { store } from './store';
import { launchParamsSelector, rconCredentialsSelector } from './selectors/app';
import { RconCommand, TRconInfo, TRconPlayer } from './types/rcon';
import { setRconCredentials } from './actions/app';

export const DesktopApi = {
  onAppEvent: (
    event: AppEvent,
    callback,
    unsubscribes?: TGenericFunction[]
  ) => {
    EventsOn(event, callback);

    const unsubscribe = () => {
      EventsOff(event, callback);
    };

    if (unsubscribes) {
      unsubscribes.push(unsubscribe);
    }

    return unsubscribe;
  },
  openUrl: async (url: string) => {
    await App.OpenInBrowser(url);
  },
  initApp: async () => {
    await App.InitApp();
  },
  getProfileImageURL: async (steamID64: string) => {
    await App.GetSteamProfileURL(steamID64);
  },
  server: {
    readConfig: async () => {
      const configString = await DedicatedServer.ReadConfig();
      const config = parseConfig(configString);

      setConfig(config);
      setRconCredentials(
        `127.0.0.1:${config[ConfigKey.RCONPort]}`,
        config[ConfigKey.AdminPassword]
      );
    },
    writeConfig: async (config: TConfig) => {
      const serializedConfig = serializeConfig(config);
      await DedicatedServer.WriteConfig(serializedConfig);

      // Read again to update the store
      await DesktopApi.server.readConfig();
    },
    readSaveName: async () => {
      const saveNameString = await DedicatedServer.ReadSaveName();

      setSaveName(saveNameString);
    },
    writeSaveName: async (saveName: string) => {
      await DedicatedServer.WriteSaveName(saveName);

      // Read again to update the store
      await DesktopApi.server.readSaveName();
    },
    start: async () => {
      const state = store.getState();
      const params = launchParamsSelector(state);
      const paramsArray =
        params
          ?.split(' ')
          .filter((p) => p !== '')
          .map((p) => p.trim()) ?? [];

      await DedicatedServer.SetLaunchParams(paramsArray);
      await DedicatedServer.Start();
    },
    stop: async () => {
      await DedicatedServer.Stop();
    },
    restart: async () => {
      await DedicatedServer.Restart();
    },
    update: async () => {
      await DedicatedServer.Update();
    }
  },
  backups: {
    start: async (interval: number, keepCount: number) => {
      await BackupManager.Start(interval, keepCount);
    },
    stop: async () => {
      await BackupManager.Stop();
    },
    getList: async () => {
      return await BackupManager.GetBackupsList();
    },
    delete: async (backupFileName: string) => {
      await BackupManager.Delete(backupFileName);
    },
    create: async () => {
      await BackupManager.CreateBackup();
    },
    open: async (backupFileName: string) => {
      await BackupManager.Open(backupFileName);
    },
    restore: async (backupFileName: string) => {
      await BackupManager.Restore(backupFileName);
    }
  },
  rcon: {
    execute: async (command: string) => {
      const state = store.getState();
      const rconCredentials = rconCredentialsSelector(state);

      const result = await RconClient.Execute(
        rconCredentials.host,
        rconCredentials.password,
        command
      );

      return result.trim();
    },
    getInfo: async (): Promise<TRconInfo | undefined> => {
      try {
        const result = (
          (await DesktopApi.rcon.execute(RconCommand.INFO)) || ''
        ).trim();

        const regex = /Welcome to Pal Server\[(.*?)\]\s*(.*)/;
        const match = result.match(regex);
        const [, version, name] = match || [];

        return {
          version,
          name
        };
      } catch {
        //
      }

      return undefined;
    },
    getPlayers: async (): Promise<TRconPlayer[]> => {
      try {
        const result = (
          (await DesktopApi.rcon.execute(RconCommand.SHOW_PLAYERS)) || ''
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

          DesktopApi.getProfileImageURL(steamId); // crawl steam profile image and cache the url in the store so we don't have to do it again for the same player

          return player;
        });

        return players;
      } catch {
        //
      }

      return [];
    },
    save: async () => {
      await DesktopApi.rcon.execute(RconCommand.SAVE);
    },
    shutdown: async (
      message: string = 'Server is being shutdown',
      seconds?: number
    ) => {
      const command = `${RconCommand.SHUTDOWN} ${seconds ?? 1} ${message}`;

      await DesktopApi.rcon.execute(command);
    },
    sendMessage: async (messages: string) => {
      const command = `${RconCommand.BROADCAST} ${messages}`;

      await DesktopApi.rcon.execute(command);
    },
    ban: async (uid: string) => {
      const command = `${RconCommand.BAN} ${uid}`;

      await DesktopApi.rcon.execute(command);
    },
    kick: async (uid: string) => {
      const command = `${RconCommand.KICK} ${uid}`;

      await DesktopApi.rcon.execute(command);
    }
  }
};
