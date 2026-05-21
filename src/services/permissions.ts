import StoragePermission from './storagePermissionPlugin';

let isRequesting = false;

export const requestStoragePermissions = async (): Promise<boolean> => {
  if (isRequesting) return false;
  isRequesting = true;

  try {
    if (typeof (window as any).Capacitor === 'undefined') {
      console.log('Not in Capacitor environment');
      isRequesting = false;
      return false;
    }

    const { Capacitor } = await import('@capacitor/core');
    const platform = Capacitor.getPlatform();
    console.log('Platform:', platform);

    const { Device } = await import('@capacitor/device');
    const info = await Device.getInfo();
    const osVersion = parseInt(info?.osVersion || '0') || 0;
    console.log('OS:', platform, 'Version:', osVersion);

    if (platform === 'android' && osVersion >= 11) {
      console.log('Android 11+, using native MANAGE_EXTERNAL_STORAGE request');

      const checkResult = await StoragePermission.checkManageExternalStorage();
      console.log('Check result:', checkResult);

      if (checkResult.granted) {
        console.log('MANAGE_EXTERNAL_STORAGE already granted');
        isRequesting = false;
        return true;
      }

      console.log('Requesting MANAGE_EXTERNAL_STORAGE via native plugin');
      const result = await StoragePermission.requestManageExternalStorage();
      console.log('Request result:', result);

      isRequesting = false;
      return result.granted === true;
    }

    if (platform === 'android' && osVersion <= 10) {
      console.log('Android <= 10, requesting storage permissions via Filesystem plugin');
      const { Filesystem } = await import('@capacitor/filesystem');
      const result = await Filesystem.requestPermissions();
      console.log('Filesystem permissions result:', result);
      isRequesting = false;
      return result.storage === 'granted';
    }

    isRequesting = false;
    return false;
  } catch (error) {
    console.error('Error in requestStoragePermissions:', error);
    isRequesting = false;
    return false;
  }
};

export const checkStoragePermissions = async (): Promise<boolean> => {
  try {
    if (typeof (window as any).Capacitor === 'undefined') {
      return false;
    }

    const { Capacitor } = await import('@capacitor/core');
    const platform = Capacitor.getPlatform();

    const { Device } = await import('@capacitor/device');
    const info = await Device.getInfo();
    const osVersion = parseInt(info?.osVersion || '0') || 0;

    if (platform === 'android' && osVersion >= 11) {
      const result = await StoragePermission.checkManageExternalStorage();
      return result.granted === true;
    }

    if (platform === 'android') {
      const { Filesystem } = await import('@capacitor/filesystem');
      const status = await Filesystem.checkPermissions();
      return status.storage === 'granted';
    }

    return false;
  } catch (error) {
    console.error('Error in checkStoragePermissions:', error);
    return false;
  }
};

export const openAppSettings = async (): Promise<void> => {
  try {
    if (typeof (window as any).Capacitor === 'undefined') {
      alert('请在手机设置中手动授予存储权限');
      return;
    }

    const { Capacitor } = await import('@capacitor/core');
    const App = Capacitor.Plugins.App;
    if (!App) {
      alert('请在手机设置 > 应用 > 文件管理器 > 权限中授予存储权限');
      return;
    }

    const appSettingsUrl = 'app-settings:';
    const canOpen = await App.canOpenUrl({ url: appSettingsUrl });

    if (canOpen?.value) {
      await App.openUrl({ url: appSettingsUrl });
    } else {
      alert('请手动前往 设置 > 应用 > 文件管理器 > 权限');
    }
  } catch (error) {
    console.error('Error opening settings:', error);
    alert('请手动前往 设置 > 应用 > 文件管理器 > 权限');
  }
};
