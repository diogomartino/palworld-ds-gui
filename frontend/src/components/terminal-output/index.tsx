import { Card, CardBody } from '@nextui-org/react';
import { TConsoleEntry } from '../../types';
import cx from 'classnames';
import { useEffect, useRef } from 'react';

type TTerminalOutputProps = {
  entries: TConsoleEntry[];
  className?: string;
};

type TEntryProps = {
  entry: TConsoleEntry;
};

const Entry = ({ entry }: TEntryProps) => {
  return (
    <div className="flex gap-1">
      <span className="text-sm text-neutral-500">
        {new Date(entry.timestamp * 1000).toLocaleTimeString()}
      </span>
      <span className="text-sm text-neutral-300">{entry.message}</span>
    </div>
  );
};

const TerminalOutput = ({ entries, className }: TTerminalOutputProps) => {
  const ref = useRef<any>();

  console.log(ref);

  useEffect(() => {
    const child = ref.current?.lastChild;

    console.log('! child', child);

    setTimeout(() => {
      child?.scrollTo(0, child.scrollHeight);
    });
  }, [entries]);

  return (
    <Card className="w-full h-full" ref={ref}>
      <CardBody className={cx('overflow-y-auto', className)}>
        {entries.map((entry, index) => (
          <Entry key={index} entry={entry} />
        ))}
      </CardBody>
    </Card>
  );
};

export default TerminalOutput;
