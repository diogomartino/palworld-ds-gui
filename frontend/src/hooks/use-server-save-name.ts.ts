import { useSelector } from 'react-redux';
import { serverSaveNameSelector } from '../selectors/server';

const useServerSaveName = () => useSelector(serverSaveNameSelector);

export default useServerSaveName;
