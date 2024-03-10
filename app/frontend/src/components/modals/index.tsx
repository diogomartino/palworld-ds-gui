import { createElement } from 'react';
import useModalsInfo from '../../hooks/use-modals-info';
import { Modal } from '../../types';
import ConfirmActionModal from './confirm-action';
import VersionMismatchModal from './version-mismatch';
import ExecRonCommandModal from './exec-rcon-command';

const ModalsMap = {
  [Modal.ACTION_CONFIRMATION]: ConfirmActionModal,
  [Modal.VERSION_MISMATCH]: VersionMismatchModal,
  [Modal.EXEC_RCON_COMMAND]: ExecRonCommandModal
};

const ModalsProvider = () => {
  const { openModal, modalProps } = useModalsInfo();

  if (!openModal || !ModalsMap[openModal]) return null;

  return createElement<any>(ModalsMap[openModal], modalProps);
};

export default ModalsProvider;
