import { AppEvent, TGenericFunction } from './types';
import { EventsOff, EventsOn } from './wailsjs/runtime/runtime';
import * as DedicatedServer from './wailsjs/go/dedicatedserver/DedicatedServer';
import * as BackupManager from './wailsjs/go/backupsmanager/BackupManager';
import * as App from './wailsjs/go/main/App';
import { parseConfig, serializeConfig } from './helpers/config-parser';
import { setConfig, setSaveName } from './actions/server';
import { TConfig } from './types/server-config';
import { store } from './store';
import { launchParamsSelector } from './selectors/app';

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
  }
};
