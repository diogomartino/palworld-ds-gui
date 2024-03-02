import { useEffect, useRef } from 'react';
import { DesktopAPI } from '../desktop';
import { checkForUpdates } from '../actions/app';
import { isWeb } from '../helpers/is-web';
import { trackWebAppOpen, trackWindowsAppOpen } from '../helpers/tracker';

const CHECK_FOR_UPDATES_INTERVAL = 1000 * 60 * 60 * 1; // 1 hour

const useEventsInit = () => {
  const hasInit = useRef(isWeb() ? true : false);
  const hasTrackerInited = useRef(false);

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
    if (hasTrackerInited.current) return;

    if (isWeb()) {
      trackWebAppOpen();
    } else {
      trackWindowsAppOpen();
    }

    hasTrackerInited.current = true;
  }, []);
};

export default useEventsInit;
