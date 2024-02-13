import { useSelector } from 'react-redux';
import { launchParamsSelector } from '../selectors/app';

const useLaunchParams = () => useSelector(launchParamsSelector);

export default useLaunchParams;
