import { useSelector } from 'react-redux';
import { steamImagesCacheSelector } from '../selectors/app';

const useSteamImages = () => useSelector(steamImagesCacheSelector);

export default useSteamImages;
