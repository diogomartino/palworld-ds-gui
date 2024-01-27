import { Button } from '@nextui-org/react';
import Layout from '../../components/layout';
import useServerConfig from '../../hooks/use-server-config';
import {
  IconArrowUpCircle,
  IconPlayerPlay,
  IconPlayerStop
} from '@tabler/icons-react';
import { ConfigKey } from '../../types/server-config';
import TerminalOutput from '../../components/terminal-output';
import useServerStatus from '../../hooks/use-server-status';
import { ConsoleId, ServerStatus } from '../../types';
import { restartServer, startServer, stopServer } from '../../actions/server';
import useConsolesById from '../../hooks/use-consoles-by-id';

const statusDict = {
  [ServerStatus.STARTED]: 'Server is running',
  [ServerStatus.STARTING]: 'Starting...',
  [ServerStatus.STOPPED]: 'Server is stopped',
  [ServerStatus.STOPPING]: 'Stopping...',
  [ServerStatus.RESTARTING]: 'Restarting...'
};

const Home = () => {
  const currentConfig = useServerConfig();
  const status = useServerStatus();
  const consoleEntries = useConsolesById([ConsoleId.SERVER]);

  const startDisabled = status !== ServerStatus.STOPPED;
  const stopDisabled = status !== ServerStatus.STARTED;
  const restartDisabled = status !== ServerStatus.STARTED;

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
          onClick={startServer}
          isLoading={status === ServerStatus.STARTING}
          isDisabled={startDisabled}
          variant="shadow"
        >
          Start
        </Button>

        <Button
          endContent={<IconPlayerStop size="1rem" />}
          color="danger"
          onClick={stopServer}
          isLoading={status === ServerStatus.STOPPING}
          isDisabled={stopDisabled}
          variant="shadow"
        >
          Stop
        </Button>

        <Button
          endContent={<IconArrowUpCircle size="1rem" />}
          color="warning"
          onClick={restartServer}
          isLoading={status === ServerStatus.RESTARTING}
          isDisabled={restartDisabled}
          variant="shadow"
        >
          Restart
        </Button>
      </div>

      <TerminalOutput entries={consoleEntries} className="h-full" />
    </Layout>
  );
};

export default Home;
