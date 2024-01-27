import { Button, Input, Switch } from '@nextui-org/react';
import Layout from '../../components/layout';
import useServerConfig from '../../hooks/use-server-config';
import { configLabels, configTypes } from '../../types/server-config';
import { useState } from 'react';
import { DesktopApi } from '../../desktop';

const InputProvider = ({ label, value, type, onChange }) => {
  if (type === 'string' || type === 'number') {
    return <Input label={label} value={value} onChange={onChange} />;
  }

  if (type === 'boolean') {
    return <Switch defaultSelected={value}>{label}</Switch>;
  }

  return null;
};

const ServerSettings = () => {
  const currentConfig = useServerConfig();
  const [config, setConfig] = useState(currentConfig);
  const [isSaving, setIsSaving] = useState(false);

  const onSaveClick = async () => {
    setIsSaving(true);
    await DesktopApi.server.writeConfig(config);
    setIsSaving(false);
  };

  return (
    <Layout
      className="relative flex flex-col gap-4"
      title="Server Settings"
      subtitle="Server must be restarted for changes to take effect"
    >
      <div className="flex flex-col gap-2">
        {config &&
          Object.keys(config).map((key) => (
            <InputProvider
              key={key}
              label={configLabels[key]}
              value={config[key]}
              type={configTypes[key]}
              onChange={(e) => {
                setConfig((prev) => ({
                  ...prev,
                  [key]: e.target.value
                }));
              }}
            />
          ))}
      </div>

      <div className="fixed w-fit bottom-4 right-10">
        <Button
          variant="shadow"
          color="primary"
          onClick={onSaveClick}
          isLoading={isSaving}
        >
          Save
        </Button>
      </div>
    </Layout>
  );
};

export default ServerSettings;
