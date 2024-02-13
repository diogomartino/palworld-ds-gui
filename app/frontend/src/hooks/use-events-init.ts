import { useEffect, useRef } from 'react';
import { DesktopAPI } from '../desktop';
import { AppEvent, TGenericFunction } from '../types';
import { addSteamImage, checkForUpdates } from '../actions/app';

const CHECK_FOR_UPDATES_INTERVAL = 1000 * 60 * 60 * 24; // 1 day

const useEventsInit = () => {
  const hasInit = useRef(false);

  useEffect(() => {
    if (!hasInit.current) {
      DesktopAPI.initApp();
      checkForUpdates();

      setInterval(() => {
        checkForUpdates();
      }, CHECK_FOR_UPDATES_INTERVAL);

      hasInit.current = true;
    }
  }, []);

  useEffect(() => {
    const unsubscribes: TGenericFunction[] = [];

    DesktopAPI.onAppEvent(
      AppEvent.RETURN_STEAM_IMAGE,
      (resultString: string) => {
        const [steamId, imageUrl] = resultString.split('|');

        addSteamImage(steamId, imageUrl);
      },
      unsubscribes
    );

    return () => {
      unsubscribes.forEach((unsubscribe) => unsubscribe());
    };
  }, []);
};

export default useEventsInit;
