import {
  Button,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader
} from '@nextui-org/react';
import { closeModals } from '../../../actions/modal';
import useModalsInfo from '../../../hooks/use-modals-info';
import { DesktopAPI } from '../../../desktop';

type TVersionMismatchModalProps = {
  clientVersion: string;
  serverVersion: string;
};

const VersionMismatchModal = ({
  clientVersion,
  serverVersion
}: TVersionMismatchModalProps) => {
  const { isModalOpen } = useModalsInfo();

  return (
    <Modal
      backdrop="blur"
      isOpen={isModalOpen}
      onClose={() => {
        closeModals();
      }}
      scrollBehavior="inside"
    >
      <ModalContent>
        <ModalHeader className="flex gap-1 items-center">
          <p>Version Mismatch</p>
        </ModalHeader>
        <ModalBody>
          <p>
            The server version is different from the client version. This may
            cause issues. Please make sure the server and this app are up to
            date.
          </p>
          <div className="flex flex-col">
            <div>
              <span className="text-gray-500">Server version:</span>
              <span className="ml-1">{serverVersion}</span>
            </div>
            <div>
              <span className="text-gray-500">Client version:</span>
              <span className="ml-1">{clientVersion}</span>
            </div>
          </div>

          <span
            className="text-blue-500 hover:underline cursor-pointer"
            onClick={() =>
              DesktopAPI.openUrl(
                'https://github.com/diogomartino/palworld-ds-gui/releases/latest'
              )
            }
          >
            Download latest versions here
          </span>
        </ModalBody>
        <ModalFooter className="justify-center">
          <Button variant="shadow" color="primary" onClick={closeModals}>
            I understand
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default VersionMismatchModal;
