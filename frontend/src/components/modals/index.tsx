import { createElement } from 'react';
import useModalsInfo from '../../hooks/use-modals-info';

const ModalsMap = {};

const ModalsProvider = () => {
  const { openModal, modalProps } = useModalsInfo();

  if (!openModal || !ModalsMap[openModal]) return null;

  return createElement(ModalsMap[openModal], modalProps);
};

export default ModalsProvider;
