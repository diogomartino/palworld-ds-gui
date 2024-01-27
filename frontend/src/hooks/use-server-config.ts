import { useSelector } from 'react-redux';
import { serverConfigSelector } from '../selectors/server';

const useServerConfig = () => useSelector(serverConfigSelector);

export default useServerConfig;
