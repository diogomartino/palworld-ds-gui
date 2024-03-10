import { Input, Switch } from '@nextui-org/react';
import { TGenericObject, TTimedRestartSettings } from '../../types';

type TTimedRestartSectionProps = {
  value: TTimedRestartSettings;
  errors: TGenericObject;
  onChange: (key: string, value: any) => void;
};

const TimedRestartSection = ({
  value,
  onChange,
  errors
}: TTimedRestartSectionProps) => {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <div>
          <p className="font-bold">Timed restart</p>
          <p className="text-sm text-neutral-500">
            Schedule server restarts at regular intervals
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

      <div className="flex justify-between items-center gap-4">
        <Input
          className="w-48"
          label="Interval"
          isInvalid={!!errors.interval}
          isDisabled={!value.enabled}
          labelPlacement="outside"
          min={0}
          max={24}
          step={0.1}
          placeholder="1"
          type="number"
          endContent={<span className="text-sm">Hours</span>}
          value={value.interval.toString()}
          onChange={(e) => onChange('interval', e.target.value)}
        />
      </div>
    </div>
  );
};

export default TimedRestartSection;
