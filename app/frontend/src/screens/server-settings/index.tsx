import { Button, Divider, Input, Switch } from '@nextui-org/react';
import Layout from '../../components/layout';
import useServerConfig from '../../hooks/use-server-config';
import { configLabels, configTypes } from '../../types/server-config';
import { useEffect, useState } from 'react';
import useServerSaveName from '../../hooks/use-server-save-name.ts';
import { TGenericObject } from '../../types/index.ts';
import { ServerAPI } from '../../server.ts';
import { notifySuccess } from '../../actions/app.ts';

const InputProvider = ({
  label,
  value,
  type,
  onChange,
  onToggleSwitch,
  ...rest
}) => {
  if (type === 'string' || type === 'number') {
    return <Input label={label} value={value} onChange={onChange} {...rest} />;
  }

  if (type === 'boolean') {
    return (
      <Switch
        // defaultSelected={value}
        isSelected={value}
        onChange={onToggleSwitch}
        {...rest}
      >
        {label}
      </Switch>
    );
  }

  return null;
};

const ServerSettings = () => {
  const currentConfig = useServerConfig();
  const currentSaveName = useServerSaveName();
  const [config, setConfig] = useState(currentConfig);
  const [saveName, setSaveName] = useState(currentSaveName);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<TGenericObject>({});

  const validate = () => {
    const saveNameRegex = /^[0-9a-fA-F]{32}$/;

    if (saveName && !saveNameRegex.test(saveName)) {
      setErrors((prev) => ({
        ...prev,
        saveName: true
      }));

      return false;
    }

    return true;
  };

  const onSaveClick = async () => {
    if (!validate()) return;

    setIsSaving(true);
    await ServerAPI.writeConfig(config);

    if (saveName) {
      await ServerAPI.writeSaveName(saveName);
    }

    setIsSaving(false);
    notifySuccess('Server settings saved');
  };

  useEffect(() => {
    // trigger a re-render when the currentConfig or currentSaveName changes (eg: other client changed the config)
    setConfig(currentConfig);
    setSaveName(currentSaveName);
  }, [currentConfig, currentSaveName]);

  return (
    <Layout
      className="relative flex flex-col gap-4"
      title="Game Settings"
      subtitle="Server must be restarted for changes to take effect"
    >
      <div className="flex flex-col gap-2 mb-8">
        {config &&
          Object.keys(config).map((key) => (
            <InputProvider
              autocomplete="off"
              key={key}
              name={key}
              label={configLabels[key]}
              value={config[key]}
              type={configTypes[key]}
              onChange={(e) => {
                setConfig((prev) => ({
                  ...prev,
                  [key]: e.target.value
                }));

                if (errors[key]) {
                  setErrors((prev) => ({
                    ...prev,
                    [key]: ''
                  }));
                }
              }}
              onToggleSwitch={() => {
                setConfig((prev) => ({
                  ...prev,
                  [key]: !config[key]
                }));
              }}
            />
          ))}

        <Divider className="mt-4 mb-4" />

        <Input
          label="Save Name"
          name="saveName"
          value={saveName}
          isInvalid={!!errors.saveName}
          onChange={(e) => {
            setErrors((prev) => ({
              ...prev,
              saveName: ''
            }));
            setSaveName(e.target.value);
          }}
        />

        {!currentSaveName && (
          <p className="text-danger-300 text-xs">
            Save name is empty, which means you probably never joined the
            server. To change this value, you must first join the server once.
          </p>
        )}
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
