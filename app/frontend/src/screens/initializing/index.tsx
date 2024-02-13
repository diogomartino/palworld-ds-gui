import { Button, Image, Input, Tooltip } from '@nextui-org/react';
import palworldLogo from '../../assets/palworld-logo.webp';
import useSocket from '../../hooks/use-socket';
import { IconInfoCircle } from '@tabler/icons-react';
import { useState } from 'react';
import { setServerCredentials } from '../../actions/app';
import useServerCredentials from '../../hooks/use-server-credentials';

const Initializing = () => {
  const serverCredentials = useServerCredentials();
  const { connecting, connect, error } = useSocket();
  const [host, setHost] = useState(serverCredentials.host);
  const [apiKey, setApiKey] = useState(serverCredentials.apiKey);

  const onConnectClick = () => {
    setServerCredentials(host, apiKey);
    connect(host, apiKey);
  };

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
          <div className="flex flex-col gap-2 w-[500px]">
            <Input
              size="lg"
              label="GUI Server Address"
              placeholder="127.0.0.1:21577"
              endContent={
                <div className="cursor-default">
                  <Tooltip
                    content="The address and port of the GUI server. Make sure you use the port of the GUI server and NOT the PalWorld server."
                    className="max-w-[300px]"
                  >
                    <IconInfoCircle color="#a0a0a0" />
                  </Tooltip>
                </div>
              }
              value={host}
              onChange={(event) => setHost(event.target.value)}
            />
            <Input
              size="lg"
              label="API Key"
              placeholder=""
              endContent={
                <div className="cursor-default">
                  <Tooltip
                    content="The API key of the GUI server. On the initial startup, the API key will be generated and shown in the console. You can also start the server with the -showkey flag to show the API key. Make sure to keep the API key secret."
                    className="max-w-[300px]"
                  >
                    <IconInfoCircle color="#a0a0a0" />
                  </Tooltip>
                </div>
              }
              value={apiKey}
              onChange={(event) => setApiKey(event.target.value)}
            />
          </div>

          {error && (
            <p className="text-red-500">
              {error === true
                ? 'Could not connect. Make sure the GUI server is running and the address and API key are correct.'
                : error}
            </p>
          )}

          <Button
            variant="shadow"
            size="lg"
            color="primary"
            onClick={onConnectClick}
            isLoading={connecting}
            isDisabled={!host || !apiKey}
          >
            Connect
          </Button>

          <div className="flex flex-col items-center">
            <p className="text-sm text-neutral-500">
              If you need help, please read the quick start guide here.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Initializing;
