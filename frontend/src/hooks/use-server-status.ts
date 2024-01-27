import { useSelector } from 'react-redux';
import { serverStatusSelector } from '../selectors/server';

const useServerStatus = () => useSelector(serverStatusSelector);

export default useServerStatus;
