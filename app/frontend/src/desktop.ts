import { AppEvent, TGenericFunction } from './types';
import { EventsOff, EventsOn } from './wailsjs/runtime/runtime';
import * as RconClient from './wailsjs/go/rconclient/RconClient';
import * as App from './wailsjs/go/main/App';
import { store } from './store';
import { rconCredentialsSelector } from './selectors/app';
import { RconCommand, TRconInfo, TRconPlayer } from './types/rcon';

export const DesktopAPI = {
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
  logToFile: async (message: string) => {
    await App.SaveLog(message);
  },
  openLogFile: async () => {
    await App.OpenLogs();
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
          (await DesktopAPI.rcon.execute(RconCommand.INFO)) || ''
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
          (await DesktopAPI.rcon.execute(RconCommand.SHOW_PLAYERS)) || ''
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

          DesktopAPI.getProfileImageURL(steamId); // crawl steam profile image and cache the url in the store so we don't have to do it again for the same player

          return player;
        });

        return players;
      } catch {
        //
      }

      return [];
    },
    save: async () => {
      await DesktopAPI.rcon.execute(RconCommand.SAVE);
    },
    shutdown: async (
      message: string = 'Server is being shutdown',
      seconds?: number
    ) => {
      const command = `${RconCommand.SHUTDOWN} ${seconds ?? 1} ${message}`;

      await DesktopAPI.rcon.execute(command);
    },
    sendMessage: async (messages: string) => {
      const command = `${RconCommand.BROADCAST} ${messages}`;

      await DesktopAPI.rcon.execute(command);
    },
    ban: async (uid: string) => {
      const command = `${RconCommand.BAN} ${uid}`;

      await DesktopAPI.rcon.execute(command);
    },
    kick: async (uid: string) => {
      const command = `${RconCommand.KICK} ${uid}`;

      await DesktopAPI.rcon.execute(command);
    }
  }
};
