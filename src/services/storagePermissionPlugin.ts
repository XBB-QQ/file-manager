import { registerPlugin } from '@capacitor/core';
import type { PluginListenerHandle } from '@capacitor/core';

export interface StoragePermissionPlugin {
  checkManageExternalStorage(): Promise<{ granted: boolean }>;
  requestManageExternalStorage(): Promise<{ granted: boolean }>;
}

const StoragePermission = registerPlugin<StoragePermissionPlugin>('StoragePermission', {
  web: () => ({
    async checkManageExternalStorage(): Promise<{ granted: boolean }> {
      return { granted: true };
    },
    async requestManageExternalStorage(): Promise<{ granted: boolean }> {
      return { granted: true };
    },
  }),
});

export default StoragePermission;
