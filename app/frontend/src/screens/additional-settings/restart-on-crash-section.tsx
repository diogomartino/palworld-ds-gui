import { Switch } from '@nextui-org/react';
import { TRestartOnCrashSettings } from '../../types';

type TRestartOnCrashSectionProps = {
  value: TRestartOnCrashSettings;
  onChange: (key: string, value: any) => void;
};

const RestartOnCrashSection = ({
  value,
  onChange
}: TRestartOnCrashSectionProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div>
          <p className="font-bold">Restart on crash</p>
          <p className="text-sm text-neutral-500">
            Automatically restart the server if it crashes
          </p>
        </div>

        <div className="flex items-center gap-4 mt-5">
          <Switch
            isSelected={value.enabled}
            onChange={() => onChange('enabled', Boolean(!value.enabled))}
          >
            Enabled
          </Switch>
        </div>
      </div>
    </div>
  );
};

export default RestartOnCrashSection;
