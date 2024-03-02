import {
  Button,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  getKeyValue
} from '@nextui-org/react';
import Layout from '../../components/layout';
import { DesktopAPI } from '../../desktop';
import { useEffect, useMemo, useRef, useState } from 'react';
import useSteamImages from '../../hooks/use-steam-images';
import {
  IconAlertCircle,
  IconDeviceFloppy,
  IconDotsVertical,
  IconHammer,
  IconRefresh,
  IconSend,
  IconUserCancel
} from '@tabler/icons-react';
import { ServerStatus, TGenericObject } from '../../types';
import { requestConfirmation } from '../../actions/modal';
import { TRconInfo, TRconPlayer } from '../../types/rcon';
import useServerConfig from '../../hooks/use-server-config';
import { ConfigKey } from '../../types/server-config';
import { notifySuccess } from '../../actions/app';
import { ServerAPI } from '../../server';
import useServerStatus from '../../hooks/use-server-status';

const columns = [
  {
    key: 'image',
    label: 'Image'
  },
  {
    key: 'name',
    label: 'Name'
  },
  {
    key: 'uid',
    label: 'Player UID'
  },
  {
    key: 'steamId',
    label: 'Steam ID'
  },
  {
    key: 'actions',
    label: 'Actions'
  }
];

type TAdminActionsProps = {
  player: TRconPlayer & {
    key: string;
    image: string;
  };
};

const AdminActions = ({ player }: TAdminActionsProps) => {
  const onBanClick = async () => {
    await requestConfirmation({
      title: 'Confirmation',
      message: `Are you sure you want to ban ${player.name}? The ban is permanent.`,
      confirmLabel: 'Ban',
      variant: 'danger',
      onConfirm: async () => {
        await ServerAPI.rcon.ban(player.uid);
      }
    });
  };

  const onKickClick = async () => {
    await requestConfirmation({
      title: 'Confirmation',
      message: `Are you sure you want to kick ${player.name}?`,
      confirmLabel: 'Kick',
      variant: 'danger',
      onConfirm: async () => {
        await ServerAPI.rcon.kick(player.uid);
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
          key="kick"
          endContent={<IconUserCancel size="1.0rem" />}
          onClick={onKickClick}
        >
          Kick
        </DropdownItem>
        <DropdownItem
          key="ban"
          className="text-danger"
          color="danger"
          endContent={<IconHammer size="1.0rem" />}
          onClick={onBanClick}
        >
          Ban
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
};

const Admin = () => {
  const serverStatus = useServerStatus();
  const hasLoadedFirst = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const steamImages = useSteamImages();
  const serverConfig = useServerConfig();
  const [isOnline, setIsOnline] = useState(false);
  const [info, setInfo] = useState<TRconInfo | undefined>();
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [rows, setRows] = useState<TGenericObject[]>([]);
  const [message, setMessage] = useState('');
  const processedRows = useMemo(() => {
    return rows.map((row) => ({
      ...row,
      image: steamImages[row.steamId]
    })) as TRconPlayer[];
  }, [rows, steamImages]);

  const loadInfo = async () => {
    setIsOnline(false);

    const result = await ServerAPI.rcon.getInfo();

    if (result?.name) {
      setIsOnline(true);
      loadPlayers();
    } else {
      setIsOnline(false);
    }

    setInfo(result);
  };

  const loadPlayers = async () => {
    setLoading(true);

    const players = await ServerAPI.rcon.getPlayers();
    const processedPlayers = players.map((player) => ({
      ...player,
      key: player.uid
    }));

    setRows(processedPlayers);
    setLoading(false);
  };

  const onSendMessageClick = async () => {
    await ServerAPI.rcon.sendMessage(message);
    setMessage('');
    notifySuccess('Message sent');
  };

  const onSaveClick = async () => {
    setIsSaving(true);
    await ServerAPI.rcon.save();
    setIsSaving(false);
    notifySuccess('Save command executed');
  };

  const onRefreshClick = async () => {
    await loadInfo();
    notifySuccess('Data refreshed');
  };

  useEffect(() => {
    if (hasLoadedFirst.current) {
      return;
    } else {
      hasLoadedFirst.current = true;
    }

    if (serverStatus !== ServerStatus.STARTED) return;

    intervalRef.current = setInterval(() => loadInfo(), 60 * 1000); // 1 minute interval to refresh the data

    loadInfo();

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Layout
      className="relative flex flex-col gap-4"
      title="Admin"
      subtitle={
        isOnline ? (
          <div>
            <span className="text-sm text-neutral-500">{info?.version} - </span>
            <span className="text-sm text-neutral-200">
              {rows.length}/{serverConfig[ConfigKey.ServerPlayerMaxNum]}
            </span>
          </div>
        ) : (
          <span className="text-sm text-neutral-500">Connecting...</span>
        )
      }
      rightSlot={
        <div className="flex gap-2 w-full justify-center items-center">
          {!serverConfig[ConfigKey.RCONEnabled] && (
            <div>
              <Tooltip content="RCON is disabled on the local server. Enable RCON on the server settings to use this section.">
                <IconAlertCircle size="1.3rem" color="yellow" />
              </Tooltip>
            </div>
          )}
        </div>
      }
    >
      <div className="flex gap-2 items-center justify-between">
        <div className="flex gap-2">
          <Tooltip content="Gets fresh data from the server">
            <Button
              variant="shadow"
              color="primary"
              size="sm"
              onClick={onRefreshClick}
              isLoading={loading}
              isDisabled={!isOnline}
              endContent={<IconRefresh size="0.9rem" />}
            >
              Refresh
            </Button>
          </Tooltip>
          <Tooltip content="Executes the save command on the server">
            <Button
              variant="shadow"
              color="primary"
              size="sm"
              onClick={onSaveClick}
              isLoading={isSaving}
              isDisabled={!isOnline}
              endContent={<IconDeviceFloppy size="0.9rem" />}
            >
              Save
            </Button>
          </Tooltip>
        </div>

        <div>
          <Input
            className="w-[300px]"
            placeholder="Write a message to send to the server..."
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                onSendMessageClick();
              }
            }}
            value={message}
            isDisabled={!isOnline}
            endContent={
              <Button
                isIconOnly
                size="sm"
                variant="light"
                onClick={onSendMessageClick}
              >
                <IconSend size="0.9rem" />
              </Button>
            }
          />
        </div>
      </div>

      <Table className="max-h-[346px]">
        <TableHeader columns={columns}>
          {(column) => <TableColumn {...column}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody
          items={processedRows}
          isLoading={loading}
          loadingContent={<Spinner />}
          className="overflow-y-scroll"
        >
          {(item) => (
            <TableRow key={item.uid}>
              {(columnKey) => {
                if (columnKey === 'actions') {
                  return (
                    <TableCell>
                      <AdminActions player={item as any} />
                    </TableCell>
                  );
                } else if (columnKey === 'image') {
                  return (
                    <TableCell>
                      <img src={item.image} width="32px" height="32px" />
                    </TableCell>
                  );
                } else if (columnKey === 'steamId') {
                  return (
                    <TableCell>
                      <span
                        className="text-blue-500 hover:underline cursor-pointer"
                        onClick={() =>
                          DesktopAPI.openUrl(
                            `https://steamcommunity.com/profiles/${item.steamId}`
                          )
                        }
                      >
                        {item.steamId}
                      </span>
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

export default Admin;
