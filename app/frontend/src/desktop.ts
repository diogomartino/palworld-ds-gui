import { AppEvent, TGenericFunction } from './types';
import { EventsOff, EventsOn } from './wailsjs/runtime/runtime';
import * as App from './wailsjs/go/main/App';
import { isWeb } from './helpers/is-web';
import { downloadFile } from './helpers/download-file';

export const DesktopAPI = {
  onAppEvent: (
    event: AppEvent,
    callback,
    unsubscribes?: TGenericFunction[]
  ) => {
    if (!isWeb()) return;

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
    if (!isWeb()) {
      await App.OpenInBrowser(url);
    } else {
      window.open(url, '_blank')?.focus();
    }
  },
  initApp: async () => {
    if (!isWeb()) return;

    await App.InitApp();
  },
  logToFile: async (message: string) => {
    if (!isWeb()) {
      await App.SaveLog(message);
    } else {
      console.log(message);
    }
  },
  openLogFile: async () => {
    if (!isWeb()) return;

    await App.OpenLogs();
  },
  downloadFile: async (url: string, fileName: string, apiKey: string) => {
    if (!isWeb()) {
      await App.DownloadFile(url, fileName, apiKey);
    } else {
      await downloadFile(url, fileName);
    }
  }
};
