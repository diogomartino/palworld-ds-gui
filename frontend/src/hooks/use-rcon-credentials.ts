import { useSelector } from 'react-redux';
import { rconCredentialsSelector } from '../selectors/app';

const useRconCredentials = () => useSelector(rconCredentialsSelector);

export default useRconCredentials;
