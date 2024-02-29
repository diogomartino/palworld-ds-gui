import { Button, Input, Switch } from '@nextui-org/react';
import { useEffect, useState } from 'react';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { TGenericObject } from '../../types';
import { changeTimedRestartSettings } from '../../actions/app';
import useTimedRestartSettings from '../../hooks/use-timed-restart-settings';

const TimedRestartSection = () => {
  const currentTimedRestartSettings = useTimedRestartSettings();

  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [settings, setSettings] = useState<TGenericObject>({
    enabled: currentTimedRestartSettings.enabled,
    intervalHours: currentTimedRestartSettings.intervalHours
  });
  const [errors, setErrors] = useState<TGenericObject>({});

  const onSaveSettingsClick = async () => {
    const newErrors: TGenericObject = {};

    if (
      isNaN(settings.intervalHours) ||
      settings.intervalHours < 0 ||
      settings.intervalHours > 24
    ) {
      newErrors.intervalHours = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    await changeTimedRestartSettings(settings.enabled, settings.intervalHours);
    setIsSaving(false);
  };
  const onSettingsChange = (key: string, value: any) => {
    const newState = { ...settings, [key]: value };

    setErrors((prev) => {
      const newErrors = { ...prev };
      delete newErrors[key];
      return newErrors;
    });
    setSettings(newState);
  };

  useEffect(() => {
    setSettings({
      enabled: currentTimedRestartSettings.enabled,
      intervalHours: currentTimedRestartSettings.intervalHours
    });
  }, [currentTimedRestartSettings]);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <p className="font-bold">Timed Restart</p>
        <p className="text-sm text-neutral-500">
          Schedule server restarts at regular intervals
        </p>
      </div>
      <div className="flex justify-between items-center gap-4">
        <Input
          className="w-48"
          label="Interval"
          isInvalid={!!errors.intervalHours}
          isDisabled={!settings.enabled}
          labelPlacement="outside"
          min={0}
          max={24}
          step={0.1}
          placeholder="1"
          type="number"
          endContent={<span className="text-sm">Hours</span>}
          value={settings.intervalHours}
          onChange={(e) => onSettingsChange('intervalHours', e.target.value)}
        />

        <div className="flex items-center gap-4 mt-5">
          <Switch
            isSelected={settings.enabled}
            onChange={() =>
              onSettingsChange('enabled', Boolean(!settings.enabled))
            }
          >
            Enabled
          </Switch>

          <Button
            variant="shadow"
            color="primary"
            isLoading={isSaving}
            onClick={onSaveSettingsClick}
            endContent={<IconDeviceFloppy size="1.0rem" />}
          >
            Save
          </Button>
        </div>
      </div>
    </div>
  );
};

export default TimedRestartSection;
