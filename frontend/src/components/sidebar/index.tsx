import {
  IconBolt,
  IconFiles,
  IconInfoHexagon,
  IconServer,
  IconSettings,
  IconSettingsUp
} from '@tabler/icons-react';
import NavItem from './nav-item';
import useHasUpdates from '../../hooks/use-latest-version';

const Sidebar = () => {
  const { hasUpdates } = useHasUpdates();

  return (
    <div className="flex flex-col w-48 bg-content2 text-white shadow-[0px_4px_16px_rgba(17,17,26,0.1),_0px_8px_24px_rgba(17,17,26,0.1),_0px_16px_56px_rgba(17,17,26,0.1)]">
      <div className="flex flex-col h-full">
        <NavItem label="Server" to="/" iconComponent={IconServer} />
        <NavItem label="Settings" to="/settings" iconComponent={IconSettings} />
        <NavItem label="Admin" to="/admin" iconComponent={IconBolt} />
        <NavItem label="Backups" to="/backups" iconComponent={IconFiles} />
        <NavItem
          label="App Settings"
          to="/app-settings"
          iconComponent={IconSettingsUp}
        />
        <NavItem
          label="About"
          to="/about"
          iconComponent={IconInfoHexagon}
          iconProps={{
            color: hasUpdates ? '#3b82f6' : '#a0a0a0',
            className: hasUpdates && 'animate-ping duration-1000'
          }}
        />
      </div>
    </div>
  );
};

export default Sidebar;
