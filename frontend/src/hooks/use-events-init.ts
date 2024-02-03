import { useEffect, useRef } from 'react';
import { DesktopApi } from '../desktop';
import {
  AppEvent,
  ConsoleId,
  LoadingStatus,
  ServerStatus,
  TConsoleEntry,
  TGenericFunction,
  TGenericObject
} from '../types';
import {
  addSteamImage,
  checkForUpdates,
  initApp,
  setLoadingStatus
} from '../actions/app';
import { addConsoleEntry } from '../actions/console';
import { setStatus } from '../actions/server';

const CHECK_FOR_UPDATES_INTERVAL = 1000 * 60 * 60 * 24; // 1 day

const useEventsInit = () => {
  const hasInit = useRef(false);

  useEffect(() => {
    if (!hasInit.current) {
      DesktopApi.initApp();
      checkForUpdates();

      setInterval(() => {
        checkForUpdates();
      }, CHECK_FOR_UPDATES_INTERVAL);

      hasInit.current = true;
    }
  }, []);

  useEffect(() => {
    const unsubscribes: TGenericFunction[] = [];

    DesktopApi.onAppEvent(
      AppEvent.RETURN_STEAM_IMAGE,
      (resultString: string) => {
        const [steamId, imageUrl] = resultString.split('|');

        addSteamImage(steamId, imageUrl);
      },
      unsubscribes
    );

    DesktopApi.onAppEvent(
      AppEvent.SET_LOADING_STATUS,
      (status: LoadingStatus) => {
        setLoadingStatus(status);

        if (status === LoadingStatus.DONE) {
          initApp();
        }
      },
      unsubscribes
    );

    DesktopApi.onAppEvent(
      AppEvent.ADD_CONSOLE_ENTRY,
      (consoleId: ConsoleId, entry: TGenericObject) => {
        const entryObj: TConsoleEntry = {
          timestamp: entry.Timestamp,
          message: entry.Message,
          msgType: entry.MsgType
        };

        addConsoleEntry(consoleId, entryObj);
      },
      unsubscribes
    );

    DesktopApi.onAppEvent(
      AppEvent.SET_SERVER_STATUS,
      (status: ServerStatus) => {
        setStatus(status);
      },
      unsubscribes
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);
};

export default useEventsInit;
