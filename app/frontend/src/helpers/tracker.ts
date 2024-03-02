import { TGenericObject, TrackingEvent } from '../types';

const getUmami = () => {
  return typeof window !== 'undefined' && (window as any).umami;
};

export const trackEvent = (event: TrackingEvent, data?: TGenericObject) => {
  const isProduction = process.env.NODE_ENV === 'production';

  // don't track events in development
  if (!isProduction) return;

  try {
    const umami = getUmami();

    if (umami) {
      umami.track(event, data);
    }
  } catch {
    // do nothing
  }
};

export const trackWindowsAppOpen = () =>
  trackEvent(TrackingEvent.WINDOWS_APP_OPEN, { version: APP_VERSION });

export const trackWebAppOpen = () =>
  trackEvent(TrackingEvent.WEB_APP_OPEN, { version: APP_VERSION });

export const trackError = (error: Error | undefined) =>
  trackEvent(TrackingEvent.ERROR, {
    message: error?.message ?? 'No message provided'
  });
