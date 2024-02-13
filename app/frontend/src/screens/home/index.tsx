import { Button, Input } from '@nextui-org/react';
import Layout from '../../components/layout';
import useServerConfig from '../../hooks/use-server-config';
import {
  IconCloudDownload,
  IconPlayerPlay,
  IconPlayerStop
} from '@tabler/icons-react';
import { ConfigKey } from '../../types/server-config';
import TerminalOutput from '../../components/terminal-output';
import useServerStatus from '../../hooks/use-server-status';
import { ServerStatus } from '../../types';
import useConsolesById from '../../hooks/use-console-entries';
import { IconRefresh } from '@tabler/icons-react';
import { requestConfirmation } from '../../actions/modal';
import { DesktopAPI } from '../../desktop';
import useLaunchParams from '../../hooks/use-launch-params';
import { setLaunchParams } from '../../actions/app';
import { ServerAPI } from '../../server';

const statusDict = {
  [ServerStatus.STARTED]: 'Server is running',
  [ServerStatus.STARTING]: 'Starting...',
  [ServerStatus.STOPPED]: 'Server is stopped',
  [ServerStatus.STOPPING]: 'Stopping...',
  [ServerStatus.RESTARTING]: 'Restarting...',
  [ServerStatus.UPDATING]: 'Updating...'
};

const Home = () => {
  const currentConfig = useServerConfig();
  const status = useServerStatus();
  const consoleEntries = useConsolesById();
  const launchParams = useLaunchParams();

  const startDisabled = status !== ServerStatus.STOPPED;
  const stopDisabled = status !== ServerStatus.STARTED;
  const restartDisabled = status !== ServerStatus.STARTED;
  const updateDisabled = status !== ServerStatus.STOPPED;

  const onLaunchParamsChange = (e) => {
    setLaunchParams(e.target.value || '');
  };

  return (
    <Layout
      className="flex flex-col gap-4"
      title={currentConfig[ConfigKey.ServerName]}
      subtitle={statusDict[status]}
    >
      <div className="flex gap-2">
        <Button
          endContent={<IconPlayerPlay size="1rem" />}
          color="success"
          onClick={ServerAPI.start}
          isLoading={status === ServerStatus.STARTING}
          isDisabled={startDisabled}
          variant="shadow"
        >
          Start
        </Button>

        <Button
          endContent={<IconPlayerStop size="1rem" />}
          color="danger"
          onClick={ServerAPI.stop}
          isLoading={status === ServerStatus.STOPPING}
          isDisabled={stopDisabled}
          variant="shadow"
        >
          Stop
        </Button>

        <Button
          endContent={<IconRefresh size="1rem" />}
          color="warning"
          onClick={ServerAPI.restart}
          isLoading={status === ServerStatus.RESTARTING}
          isDisabled={restartDisabled}
          variant="shadow"
        >
          Restart
        </Button>

        <Button
          endContent={<IconCloudDownload size="1rem" />}
          color="secondary"
          onClick={async () => {
            await requestConfirmation({
              title: 'Are you sure you want to update the server?',
              message: (
                <>
                  <p>
                    This will stop the server and update it to the latest
                    version.{' '}
                    <span className="font-bold">
                      Make sure to backup your server first
                    </span>
                    , new updates may introduce breaking changes.
                  </p>
                  <p>
                    Update notes should be available here:{' '}
                    <span
                      className="text-blue-500 hover:underline cursor-pointer"
                      onClick={() =>
                        DesktopAPI.openUrl(
                          'https://store.steampowered.com/news/app/1623730'
                        )
                      }
                    >
                      https://store.steampowered.com/news/app/1623730
                    </span>
                  </p>
                </>
              ),
              cancelLabel: 'Cancel',
              confirmLabel: 'Update',
              onConfirm: ServerAPI.update
            });
          }}
          isLoading={status === ServerStatus.UPDATING}
          isDisabled={updateDisabled}
          variant="shadow"
        >
          Update Server
        </Button>
      </div>

      <Input
        size="sm"
        label="Launch params"
        value={launchParams}
        onChange={onLaunchParamsChange}
      />

      <TerminalOutput entries={consoleEntries} className="h-full" />
    </Layout>
  );
};

export default Home;
