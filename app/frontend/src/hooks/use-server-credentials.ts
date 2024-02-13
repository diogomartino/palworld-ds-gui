import { useSelector } from 'react-redux';
import { serverCredentialsSelector } from '../selectors/app';

const useServerCredentials = () => useSelector(serverCredentialsSelector);

export default useServerCredentials;
