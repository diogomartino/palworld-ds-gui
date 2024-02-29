import { Route, Routes } from 'react-router';
import Home from '../../screens/home';
import ServerSettings from '../../screens/server-settings';
import AppSettings from '../../screens/app-settings';
import Admin from '../../screens/admin';
import Backups from '../../screens/backups';
import About from '../../screens/about';
import AdditionalSettings from '../../screens/additional-settings';

const Routing = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/settings" element={<ServerSettings />} />
      <Route path="/additional-settings" element={<AdditionalSettings />} />
      <Route path="/app-settings" element={<AppSettings />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/backups" element={<Backups />} />
      <Route path="/about" element={<About />} />
    </Routes>
  );
};

export default Routing;
