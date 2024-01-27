import { Image, Spinner } from '@nextui-org/react';
import { LoadingStatus } from '../../types';
import palworldLogo from '../../assets/palworld-logo.webp';
import useLoadingStatus from '../../hooks/use-loading-status';

const statusText = {
  [LoadingStatus.IDLE]: 'Waiting...',
  [LoadingStatus.INSTALLING_STEAMCMD]: 'Installing SteamCMD...',
  [LoadingStatus.INSTALLING_SERVER]: 'Installing dedicated server...',
  [LoadingStatus.DONE]: 'Done!'
};

const Initializing = () => {
  const status = useLoadingStatus();

  console.log(' useLoadingStatus()', status);

  return (
    <div className="flex flex-col justify-center items-center h-full">
      <div className="flex flex-col items-center h-full">
        <Image
          src={palworldLogo}
          alt="Palworld Logo"
          width={350}
          height={350}
        />
        <p className="text-xl font-bold text-center">Dedicated Server GUI</p>
        <p className="text-sm text-neutral-500">v{APP_VERSION}</p>

        <div className="flex flex-col h-full justify-center items-center gap-4">
          <p className="text-4xl">Initializing, please wait.</p>
          <Spinner size="lg" />
          <p>{statusText[status] || `Unknown`}</p>

          <div className="flex flex-col items-center">
            <p className="text-sm text-neutral-500">
              Be patient, this may take a while depending on your internet speed
              and computer specs.
            </p>

            <p className="text-sm text-neutral-500">
              Do not close any terminal that pops up, otherwise the installation
              will fail.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Initializing;
