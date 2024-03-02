import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import viteCompression from 'vite-plugin-compression';
import wails from '../wails.json' assert { type: 'json' };

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), viteCompression()],
  server: {
    port: 34115,
    hmr: {
      host: 'localhost',
      port: 34115,
      protocol: 'ws'
    }
  },
  define: {
    APP_VERSION: JSON.stringify(wails.info.productVersion)
  }
});
