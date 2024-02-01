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
  getKeyValue
} from '@nextui-org/react';
import Layout from '../../components/layout';
import { DesktopApi } from '../../desktop';
import { useEffect, useState } from 'react';
import useSteamImages from '../../hooks/use-steam-images';
import {
  IconDotsVertical,
  IconFolderOpen,
  IconHammer,
  IconRestore,
  IconTrash
} from '@tabler/icons-react';
import { TGenericObject } from '../../types';
import { requestConfirmation } from '../../actions/modal';
import { cacheSteamImage } from '../../actions/app';

/*
name,playeruid,steamid
*/

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
    key: 'playeruid',
    label: 'Player UID'
  },
  {
    key: 'steamid',
    label: 'Steam ID'
  },
  {
    key: 'actions',
    label: 'Actions'
  }
];

const rows = [];

type TAdminActionsProps = {
  stuff: string;
};

const AdminActions = ({ stuff }: TAdminActionsProps) => {
  const onBanClick = async () => {
    await requestConfirmation({
      title: 'Confirmation',
      message:
        'Are you sure you want to ban this player? The ban is permanent.',
      confirmLabel: 'Delete',
      variant: 'danger',
      onConfirm: async () => {
        // await DesktopApi.backups.delete(backup.originalName);
        // await loadList();
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
          key="delete"
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
  const steamImages = useSteamImages();
  const [rows, setRows] = useState<any[]>([]);

  console.log('! steamImages', steamImages);

  const loadPlayers = async () => {
    const info = await DesktopApi.rcon.getInfo();
  };

  useEffect(() => {
    loadPlayers();
  }, []);

  return (
    <Layout
      className="relative flex flex-col gap-4"
      title="Admin"
      subtitle="Not implemented yet"
      rightSlot={<Input size="sm" label="Password" />}
    >
      <Table className="max-h-[326px]">
        <TableHeader columns={columns}>
          {(column) => <TableColumn {...column}>{column.label}</TableColumn>}
        </TableHeader>
        <TableBody
          items={rows}
          // isLoading={loading}
          // loadingContent={<Spinner />}
          className="overflow-y-scroll"
        >
          {(item) => (
            <TableRow key={item.key}>
              {(columnKey) => {
                if (columnKey === 'actions') {
                  return (
                    <TableCell>
                      <AdminActions />
                    </TableCell>
                  );
                } else if (columnKey === 'image') {
                  return (
                    <TableCell>
                      <img src={item.image} width="32px" height="32px" />
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
