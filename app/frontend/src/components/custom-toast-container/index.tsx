import { ToastContainer, Slide } from 'react-toastify';
import useSelectedTheme from '../../hooks/use-selected-theme';

const CustomToastContainer = () => {
  const theme = useSelectedTheme();

  return (
    <ToastContainer
      position="bottom-center"
      autoClose={5000}
      hideProgressBar={false}
      newestOnTop={false}
      closeOnClick
      rtl={false}
      pauseOnFocusLoss
      draggable
      pauseOnHover
      theme={theme}
      transition={Slide}
    />
  );
};

export default CustomToastContainer;
