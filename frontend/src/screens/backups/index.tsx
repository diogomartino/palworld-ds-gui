import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Spinner,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  getKeyValue
} from '@nextui-org/react';
import Layout from '../../components/layout';
import { DesktopApi } from '../../desktop';
import { useEffect, useMemo, useState } from 'react';
import { GetBackupsList } from '../../wailsjs/go/backupsmanager/BackupManager';
import bytesToMb from '../../helpers/bytes-to-mb';
import {
  IconDotsVertical,
  IconFolderOpen,
  IconRestore,
  IconTrash
} from '@tabler/icons-react';
import { requestConfirmation } from '../../actions/modal';
import { TGenericObject } from '../../types';
import useSettings from '../../hooks/use-settings';
import { changeBackupSettings } from '../../actions/app';

const columns = [
  {
    key: 'save',
    label: 'Save Name',
    width: 64
  },
  {
    key: 'date',
    label: 'Date'
  },
  {
    key: 'size',
    label: 'Size'
  },
  {
    key: 'actions',
    label: 'Actions',
    width: 64
  }
];

type TBackupActionsProps = {
  backup: TGenericObject;
  loadList: () => void;
};

const BackupActions = ({ backup, loadList }: TBackupActionsProps) => {
  const onRestoreClick = async () => {
    await requestConfirmation({
      title: 'Confirmation',
      message:
        'Are you sure you want to restore this backup? This action is irreversible. Make sure you have a backup of your current save.',
      confirmLabel: 'Restore',
      onConfirm: async () => {
        await DesktopApi.backups.restore(backup.originalName);
      }
    });
  };

  const onDeleteClick = async () => {
    await requestConfirmation({
      title: 'Confirmation',
      message:
        'Are you sure you want to delete this backup? This action is irreversible.',
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        await DesktopApi.backups.delete(backup.originalName);
        await loadList();
      }
    });
  };

  return (
    <Dropdown>
      <DropdownTrigger>
        <Button size="sm" isIconOnly variant="light">
          <IconDotsVertical size="1.0rem" />
        </Button>
      </DropdownTrigger>
      <DropdownMenu aria-label="Static Actions">
        <DropdownItem
          key="open"
          endContent={<IconFolderOpen size="1.0rem" />}
          onClick={() => {
            DesktopApi.backups.open(backup.originalName);
          }}
        >
          Show in Explorer
        </DropdownItem>
        <DropdownItem
          key="restore"
          endContent={<IconRestore size="1.0rem" />}
          onClick={onRestoreClick}
        >
          Restore
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          endContent={<IconTrash size="1.0rem" />}
          onClick={onDeleteClick}
        >
          Delete backup
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

const Backups = () => {
  const { backup: currentBackupSettings } = useSettings();
  const [backups, setBackups] = useState<TGenericObject[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [settings, setSettings] = useState<TGenericObject>({
    enabled: currentBackupSettings.enabled,
    intervalHours: currentBackupSettings.intervalHours,
    keepCount: currentBackupSettings.keepCount
  });

  const rows = useMemo(() => {
    return backups.map((backup) => ({
      key: backup.Filename,
      originalName: backup.Filename,
      save: `${backup.SaveName.substring(0, 12)}...${backup.SaveName.substring(
        backup.SaveName.length - 12
      )}`,
      date: new Date(backup.Timestamp * 1000).toLocaleString(),
      size: `${bytesToMb(backup.Size)} MB`
    }));
  }, [backups]);

  const onCreateBackupClick = async () => {
    setIsCreating(true);
    await DesktopApi.backups.create();
    await loadList();
    setIsCreating(false);
  };

  const loadList = async () => {
    setLoading(true);
    setBackups(await GetBackupsList());
    setLoading(false);
  };

  const onSettingsChange = (key: string, value: any) => {
    const newState = { ...settings, [key]: value };

    if (key === 'intervalHours') {
      if (value < 1) newState.intervalHours = 1;
      if (value > 24) newState.intervalHours = 24;
    } else if (key === 'keepCount') {
      if (value < 1) newState.keepCount = 1;
      if (value > 20) newState.keepCount = 20;
    }

    setSettings(newState);
    changeBackupSettings(
      newState.enabled,
      newState.intervalHours,
      newState.keepCount
    );
  };

  useEffect(() => {
    loadList();
  }, []);

  return (
    <Layout
      className="relative flex flex-col gap-4"
      title="Backups"
      subtitle="Manage your backups"
    >
      <div className="flex items-center gap-4">
        <Input
          label="Interval"
          labelPlacement="outside"
          placeholder="1"
          type="number"
          endContent={<span className="text-sm">Hours</span>}
          value={settings.intervalHours}
          onChange={(e) =>
            onSettingsChange('intervalHours', parseInt(e.target.value))
          }
        />

        <Input
          label="Keep"
          labelPlacement="outside"
          placeholder="6"
          type="number"
          endContent={<span className="text-sm">Backups</span>}
          value={settings.keepCount}
          onChange={(e) =>
            onSettingsChange('keepCount', parseInt(e.target.value))
          }
        />

        <div className="flex items-center gap-4 mt-5">
          <Switch
            defaultSelected={settings.enabled}
            onChange={() =>
              onSettingsChange('enabled', Boolean(!settings.enabled))
            }
          >
            Enabled
          </Switch>

          <Button
            variant="shadow"
            color="primary"
            isLoading={isCreating}
            onClick={onCreateBackupClick}
          >
            Create backup now
          </Button>
        </div>
      </div>

      <Table className="max-h-[326px]">
        <TableHeader columns={columns}>
          {(column) => <TableColumn {...column}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody
          items={rows}
          isLoading={loading}
          loadingContent={<Spinner />}
          className="overflow-y-scroll"
        >
          {(item) => (
            <TableRow key={item.key}>
              {(columnKey) => {
                if (columnKey === 'actions') {
                  return (
                    <TableCell>
                      <BackupActions backup={item} loadList={loadList} />
                    </TableCell>
                  );
                }

                return <TableCell>{getKeyValue(item, columnKey)}</TableCell>;
              }}
            </TableRow>
          )}
        </TableBody>
      </Table>
    </Layout>
  );
};

export default Backups;
