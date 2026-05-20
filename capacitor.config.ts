import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.filemanager.app',
  appName: '文件管理器',
  webDir: 'dist',
  server: {
    androidScheme: 'http'
  }
};

export default config;
