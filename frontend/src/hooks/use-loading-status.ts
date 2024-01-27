import { useSelector } from 'react-redux';
import { loadingStatusSelector } from '../selectors/app';

const useLoadingStatus = () => useSelector(loadingStatusSelector);

export default useLoadingStatus;
