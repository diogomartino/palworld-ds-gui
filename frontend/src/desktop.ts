import { AppEvent, TGenericFunction } from './types';
import { EventsOff, EventsOn } from './wailsjs/runtime/runtime';
import * as DedicatedServer from './wailsjs/go/dedicatedserver/DedicatedServer';
import * as App from './wailsjs/go/main/App';
import { parseConfig, serializeConfig } from './helpers/config-parser';
import { setConfig } from './actions/server';
import { TConfig } from './types/server-config';

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
  server: {
    readConfig: async () => {
      const configString = await DedicatedServer.ReadConfig();
      const config = parseConfig(configString);

      setConfig(config);
    },
    writeConfig: async (config: TConfig) => {
      const serializedConfig = serializeConfig(config);
      await DedicatedServer.WriteConfig(serializedConfig);

      // Read again to update the store
      await DesktopApi.server.readConfig();
    },
    start: async () => {
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
  }
};
