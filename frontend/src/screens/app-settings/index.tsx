import { Button } from '@nextui-org/react';
import Layout from '../../components/layout';
import { toggleTheme } from '../../actions/app';
import useSelectedTheme from '../../hooks/use-selected-theme';
import { IconMoon, IconSun } from '@tabler/icons-react';

const AppSettings = () => {
  const theme = useSelectedTheme();

  return (
    <Layout className="relative flex flex-col gap-4" title="App Settings">
      <div className="flex flex-col gap-2">
        <Button
          onClick={toggleTheme}
          variant="shadow"
          color="primary"
          endContent={theme === 'light' ? <IconMoon /> : <IconSun />}
        >
          Change to {theme === 'light' ? 'dark' : 'light'} theme
        </Button>
      </div>
    </Layout>
  );
};

export default AppSettings;
