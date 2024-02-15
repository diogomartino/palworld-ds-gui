import { Button } from '@nextui-org/react';
import { ErrorBoundary } from 'react-error-boundary';
import { DesktopAPI } from '../../desktop';
import { useCallback } from 'react';

type TErrorBoundaryProps = {
  children: React.ReactNode;
};

type TErrorFallbackProps = {
  error: Error;
  resetErrorBoundary: () => void;
};

const ErrorFallback = ({ error }: TErrorFallbackProps) => {
  return (
    <div className="flex flex-col gap-2 justify-center items-center h-full w-full">
      <p className="text-red-500 text-6xl">ERROR</p>
      <p className="text-lg">
        Something went wrong and the application could not recover :(
      </p>
      <p className="text-sm text-neutral-500">Error: {error.message}</p>

      <Button
        variant="flat"
        color="primary"
        onClick={() => {
          window.location.href = '/';
        }}
      >
        Reload Application
      </Button>

      <p className="text-sm text-neutral-500">
        If the error persists, please open an issue on GitHub{' '}
        <span
          className="text-blue-500 hover:underline cursor-pointer"
          onClick={() =>
            DesktopAPI.openUrl(
              'https://github.com/diogomartino/palworld-ds-gui/issues'
            )
          }
        >
          here.
        </span>
      </p>
    </div>
  );
};

const CustomErrorBoundary = ({ children }: TErrorBoundaryProps) => {
  const logError = useCallback((error: Error) => {
    DesktopAPI.logToFile(error.stack ?? error.message);
  }, []);

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback} onError={logError}>
      {children}
    </ErrorBoundary>
  );
};

export default CustomErrorBoundary;
