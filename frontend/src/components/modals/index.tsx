import { createElement } from 'react';
import useModalsInfo from '../../hooks/use-modals-info';
import { Modal } from '../../types';
import ConfirmActionModal from './confirm-action';

const ModalsMap = {
  [Modal.ACTION_CONFIRMATION]: ConfirmActionModal
};

const ModalsProvider = () => {
  const { openModal, modalProps } = useModalsInfo();

  if (!openModal || !ModalsMap[openModal]) return null;

  return createElement(ModalsMap[openModal], modalProps);
};

export default ModalsProvider;
