import { IRootState } from '../store';

export const socketStateSelector = (state: IRootState) => state.socket;
