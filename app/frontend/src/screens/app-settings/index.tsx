import { Button } from '@nextui-org/react';
import Layout from '../../components/layout';
import { notifySuccess, toggleTheme } from '../../actions/app';
import useSelectedTheme from '../../hooks/use-selected-theme';
import {
  IconClearAll,
  IconMoon,
  IconSun,
  IconWriting
} from '@tabler/icons-react';
import { DesktopAPI } from '../../desktop';
import { requestConfirmation } from '../../actions/modal';
import { isWeb } from '../../helpers/is-web';

const AppSettings = () => {
  const theme = useSelectedTheme();

  const onClearCacheClick = async () => {
    requestConfirmation({
      title: 'Clear Data',
      message:
        'Are you sure you want to clear your data? All your app settings will be lost. The data of your dedicated server will NOT be affected. This can help to solve some issues. You will need to restart the app after clearing the data.',
      onConfirm: () => {
        localStorage.clear();
        notifySuccess('Data cleared. Please restart the app.');
      }
    });
  };

  return (
    <Layout className="relative flex flex-col gap-4" title="App Settings">
      <div className="flex flex-row gap-2">
        <Button
          onClick={toggleTheme}
          variant="shadow"
          color="primary"
          endContent={
            theme === 'light' ? (
              <IconMoon size="1.0rem" />
            ) : (
              <IconSun size="1.0rem" />
            )
          }
        >
          Change to {theme === 'light' ? 'dark' : 'light'} theme
        </Button>

        {!isWeb() && (
          <Button
            onClick={DesktopAPI.openLogFile}
            variant="shadow"
            color="secondary"
            endContent={<IconWriting size="1.0rem" />}
          >
            Open Logs Folder
          </Button>
        )}

        <Button
          onClick={onClearCacheClick}
          variant="shadow"
          color="danger"
          endContent={<IconClearAll size="1.0rem" />}
        >
          Clear Data
        </Button>
      </div>
    </Layout>
  );
};

export default AppSettings;
