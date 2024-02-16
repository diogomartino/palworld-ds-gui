import { createElement } from 'react';
import useModalsInfo from '../../hooks/use-modals-info';
import { Modal } from '../../types';
import ConfirmActionModal from './confirm-action';
import VersionMismatchModal from './version-mismatch';

const ModalsMap = {
  [Modal.ACTION_CONFIRMATION]: ConfirmActionModal,
  [Modal.VERSION_MISMATCH]: VersionMismatchModal
};

const ModalsProvider = () => {
  const { openModal, modalProps } = useModalsInfo();

  if (!openModal || !ModalsMap[openModal]) return null;

  return createElement<any>(ModalsMap[openModal], modalProps);
};

export default ModalsProvider;
