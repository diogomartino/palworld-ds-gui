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
import { useEffect, useMemo, useState } from 'react';
import bytesToMb from '../../helpers/bytes-to-mb';
import {
  IconArchive,
  IconDeviceFloppy,
  IconDotsVertical,
  IconRestore,
  IconTrash
} from '@tabler/icons-react';
import { requestConfirmation } from '../../actions/modal';
import { TGenericObject } from '../../types';
import { changeBackupSettings, notifySuccess } from '../../actions/app';
import { ServerAPI } from '../../server';
import useBackupsList from '../../hooks/use-backups-list';
import useBackupSettings from '../../hooks/use-backup-settings';
import useServerCredentials from '../../hooks/use-server-credentials';
import { DesktopAPI } from '../../desktop';

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
};

const BackupActions = ({ backup }: TBackupActionsProps) => {
  const serverCredentials = useServerCredentials();

  const onRestoreClick = async () => {
    await requestConfirmation({
      title: 'Confirmation',
      message:
        'Are you sure you want to restore this backup? This action is irreversible. Make sure you have a backup of your current save.',
      confirmLabel: 'Restore',
      onConfirm: async () => {
        await ServerAPI.backups.restore(backup.originalName);
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
        await ServerAPI.backups.delete(backup.originalName);
      }
    });
  };

  const onDownloadClick = () => {
    DesktopAPI.downloadFile(
      `http://${serverCredentials.host}/backups/${backup.originalName}`,
      backup.originalName,
      serverCredentials.apiKey
    );

    notifySuccess('Backup download started.');
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
          key="download"
          endContent={<IconRestore size="1.0rem" />}
          onClick={onDownloadClick}
        >
          Download
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
  const currentBackupSettings = useBackupSettings();
  const backups = useBackupsList();
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [settings, setSettings] = useState<TGenericObject>({
    enabled: currentBackupSettings.enabled,
    intervalHours: currentBackupSettings.intervalHours,
    keepCount: currentBackupSettings.keepCount
  });
  const [errors, setErrors] = useState<TGenericObject>({});

  const rows = useMemo(() => {
    return backups.map((backup) => ({
      key: backup.fileName,
      originalName: backup.fileName,
      save: `${backup.saveName.substring(0, 12)}...${backup.saveName.substring(
        backup.saveName.length - 12
      )}`,
      date: new Date(backup.timestamp * 1000).toLocaleString(),
      size: `${bytesToMb(backup.size)} MB`
    }));
  }, [backups]);

  const onCreateBackupClick = async () => {
    setIsCreating(true);
    await ServerAPI.backups.create();
    setIsCreating(false);
  };

  const onSaveSettingsClick = async () => {
    const newErrors: TGenericObject = {};

    if (
      isNaN(settings.intervalHours) ||
      settings.intervalHours < 0 ||
      settings.intervalHours > 24
    ) {
      newErrors.intervalHours = true;
    }

    if (
      isNaN(settings.keepCount) ||
      settings.keepCount < 1 ||
      settings.keepCount > 100
    ) {
      newErrors.keepCount = true;
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSaving(true);
    await changeBackupSettings(
      settings.enabled,
      settings.intervalHours,
      settings.keepCount
    );
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
      enabled: currentBackupSettings.enabled,
      intervalHours: currentBackupSettings.intervalHours,
      keepCount: currentBackupSettings.keepCount
    });
  }, [currentBackupSettings]);

  return (
    <Layout
      className="relative flex flex-col gap-4"
      title="Backups"
      subtitle="Manage your backups"
      rightSlot={
        <Button
          variant="shadow"
          color="secondary"
          isLoading={isCreating}
          onClick={onCreateBackupClick}
          endContent={<IconArchive size="1.0rem" />}
        >
          Create new backup now
        </Button>
      }
    >
      <div className="flex items-center gap-4">
        <Input
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

        <Input
          label="Keep"
          isInvalid={!!errors.keepCount}
          isDisabled={!settings.enabled}
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

      <Table className="max-h-[326px]">
        <TableHeader columns={columns}>
          {(column) => <TableColumn {...column}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody
          items={rows}
          loadingContent={<Spinner />}
          className="overflow-y-scroll"
        >
          {(item) => (
            <TableRow key={item.key}>
              {(columnKey) => {
                if (columnKey === 'actions') {
                  return (
                    <TableCell>
                      <BackupActions backup={item} />
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
