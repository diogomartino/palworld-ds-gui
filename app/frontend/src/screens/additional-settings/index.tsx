import { useEffect, useState } from 'react';
import Layout from '../../components/layout';
import useAdditionalSettings from '../../hooks/use-additional-settings';
import TimedRestartSection from './timed-restart-section';
import { TAdditionalSettings, TGenericObject } from '../../types';
import { Button } from '@nextui-org/react';
import { IconDeviceFloppy } from '@tabler/icons-react';
import { saveAdditionalSettings } from '../../actions/app';
import RestartOnCrashSection from './restart-on-crash-section';

const EMPTY_ERRORS = {
  timedRestart: {
    interval: false
  }
};

const AdditionalSettings = () => {
  const currentAdditionalSettings = useAdditionalSettings();
  const [additionalSettings, setAdditionalSettings] =
    useState<TAdditionalSettings>(currentAdditionalSettings);
  const [errors, setErrors] = useState<TGenericObject>(EMPTY_ERRORS);
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const onSaveSettingsClick = async () => {
    const newErrors: TGenericObject = structuredClone(EMPTY_ERRORS);

    if (
      !additionalSettings.timedRestart.interval ||
      isNaN(additionalSettings.timedRestart.interval) ||
      additionalSettings.timedRestart.interval <= 0 ||
      additionalSettings.timedRestart.interval > 24
    ) {
      newErrors.timedRestart.interval = true;
    }

    const hasErrors = Object.values(newErrors).some((error) =>
      Object.values(error).some((value) => value === true)
    );

    if (hasErrors) {
      setErrors(structuredClone(newErrors));
      return;
    }

    setIsSaving(true);
    await saveAdditionalSettings(additionalSettings);
    setIsSaving(false);
  };

  useEffect(() => {
    // if other client changed the settings, update the local state
    setAdditionalSettings(currentAdditionalSettings);
  }, [currentAdditionalSettings]);

  return (
    <Layout
      className="relative flex flex-col gap-4"
      title="Additional Settings"
    >
      <TimedRestartSection
        value={additionalSettings.timedRestart}
        errors={errors.timedRestart}
        onChange={(key, value) => {
          setAdditionalSettings((prev) => ({
            ...prev,
            timedRestart: { ...prev.timedRestart, [key]: value }
          }));

          setErrors((prev) => ({
            ...prev,
            timedRestart: { ...prev.timedRestart, [key]: false }
          }));
        }}
      />

      <RestartOnCrashSection
        value={additionalSettings.restartOnCrash}
        onChange={(key, value) => {
          setAdditionalSettings((prev) => ({
            ...prev,
            restartOnCrash: { ...prev.restartOnCrash, [key]: value }
          }));
        }}
      />

      <Button
        variant="shadow"
        color="primary"
        isLoading={isSaving}
        onClick={onSaveSettingsClick}
        endContent={<IconDeviceFloppy size="1.0rem" />}
      >
        Save
      </Button>
    </Layout>
  );
};

export default AdditionalSettings;
