import { appSliceActions } from '../store/app-slice';
import { store } from '../store';
import { LoadingStatus } from '../types';

export const setLoadingStatus = (loadingStatus: LoadingStatus) => {
  store.dispatch(appSliceActions.setLoadingStatus(loadingStatus));
};

export const toggleTheme = () => {
  store.dispatch(appSliceActions.toggleTheme());
};
