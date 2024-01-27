import {
  IconBolt,
  IconFiles,
  IconInfoHexagon,
  IconServer,
  IconSettings,
  IconSettingsUp
} from '@tabler/icons-react';
import NavItem from './nav-item';

const Sidebar = () => {
  return (
    <div className="flex flex-col w-48 bg-content1 text-white">
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
        <NavItem label="About" to="/about" iconComponent={IconInfoHexagon} />
      </div>
    </div>
  );
};

export default Sidebar;
