import { Button } from '@nextui-org/react';
import Layout from '../../components/layout';
import { DesktopApi } from '../../desktop';
import useHasUpdates from '../../hooks/use-latest-version';
import { checkForUpdates } from '../../actions/app';
import { useState } from 'react';
import { IconRefresh } from '@tabler/icons-react';

const About = () => {
  const [loading, setLoading] = useState(false);
  const { hasUpdates, latestVersion } = useHasUpdates();

  const onCheckForUpdatesClick = async () => {
    setLoading(true);
    await checkForUpdates();
    setLoading(false);
  };

  return (
    <Layout
      className="relative flex flex-col gap-4"
      title="About"
      subtitle={
        <p className="text-sm text-neutral-500">
          v{APP_VERSION}
          {' - '}
          {hasUpdates ? (
            <span
              className="text-blue-500 hover:underline cursor-pointer animate-pulse"
              onClick={() =>
                DesktopApi.openUrl(
                  'https://github.com/diogomartino/palworld-ds-gui/releases/latest'
                )
              }
            >
              A new version is available (v{latestVersion})
            </span>
          ) : (
            <span>You are using the latest version 🎉</span>
          )}
        </p>
      }
    >
      <div>
        <Button
          variant="shadow"
          color="secondary"
          size="sm"
          onClick={onCheckForUpdatesClick}
          isLoading={loading}
          endContent={<IconRefresh size="0.9rem" />}
        >
          Check for updates now
        </Button>
      </div>

      <p>
        This software is open source and available{' '}
        <span
          className="text-blue-500 hover:underline cursor-pointer"
          onClick={() =>
            DesktopApi.openUrl(
              'https://github.com/diogomartino/palworld-ds-gui'
            )
          }
        >
          here
        </span>
        . Contributions are welcome.
      </p>
      <p>
        This software is not affiliated with or endorsed by the original authors
        of the software it is intended to manage.
      </p>
      <p>
        Licensed under the{' '}
        <span
          className="text-blue-500 hover:underline cursor-pointer"
          onClick={() =>
            DesktopApi.openUrl('https://opensource.org/licenses/MIT')
          }
        >
          MIT License
        </span>
        .
      </p>
      <p>
        Created by{' '}
        <span
          className="text-blue-500 hover:underline cursor-pointer"
          onClick={() => DesktopApi.openUrl('https://github.com/diogomartino')}
        >
          Diogo Martino
        </span>
      </p>
    </Layout>
  );
};

export default About;
