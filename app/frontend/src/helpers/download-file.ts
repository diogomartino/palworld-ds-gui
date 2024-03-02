import { serverCredentialsSelector } from '../selectors/app';
import { store } from '../store';

export const downloadFile = async (url, fileName) => {
  const state = store.getState();
  const { apiKey } = serverCredentialsSelector(state);

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Authorization: `${apiKey}`
      }
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = blobUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Download failed:', error);
  }
};
