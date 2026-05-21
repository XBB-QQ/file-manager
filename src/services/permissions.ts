export const requestStoragePermissions = async (): Promise<boolean> => {
  try {
    if (typeof (window as any).Capacitor === 'undefined') {
      console.log('Not in Capacitor environment, allowing access');
      return true;
    }

    const { Permissions } = await import('@capacitor/core');

    console.log('Checking permissions first...');
    const checkResult = await Permissions.checkPermissions({
      permissions: ['storage'],
    });

    console.log('Current permission state:', checkResult.storage);

    if (checkResult.storage === 'granted') {
      console.log('Permission already granted');
      return true;
    }

    console.log('Requesting permissions...');
    const result = await Permissions.requestPermissions({
      permissions: ['storage'],
    });

    console.log('Permission request result:', result);

    const storagePermission = result.storage;

    if (storagePermission === 'granted' || storagePermission === 'prompt-with-rationale') {
      console.log('Storage permission granted');
      return true;
    }

    console.log('Storage permission denied or prompt needed:', storagePermission);

    const { Device } = await import('@capacitor/device');
    const info = await Device.getInfo();
    console.log('Device OS:', info.osName, 'Version:', info.osVersion);

    const osVersion = parseInt(info.osVersion) || 0;
    if (info.osName === 'android' && osVersion >= 11) {
      console.log('Android 11+, needs MANAGE_EXTERNAL_STORAGE');
      await openAndroid11Settings();
    }

    return false;
  } catch (error) {
    console.error('Error requesting permissions:', error);

    try {
      const { Device } = await import('@capacitor/device');
      const info = await Device.getInfo();
      const osVersion = parseInt(info.osVersion) || 0;
      if (info.osName === 'android' && osVersion >= 11) {
        await openAndroid11Settings();
      }
    } catch (e) {
      console.error('Failed to check device info');
    }

    return false;
  }
};

const openAndroid11Settings = async (): Promise<void> => {
  try {
    const { App } = await import('@capacitor/app');
    await App.openUrl({
      url: 'package:com.filemanager.app',
    });
    await new Promise(resolve => setTimeout(resolve, 1000));
    await App.openUrl({
      url: 'app-settings:',
    });
  } catch (error) {
    console.error('Error opening Android 11 settings:', error);
    alert('请手动前往设置 > 应用 > 文件管理器 > 权限，开启「所有文件访问权限」');
  }
};

export const checkStoragePermissions = async (): Promise<boolean> => {
  try {
    if (typeof (window as any).Capacitor === 'undefined') {
      return true;
    }

    const { Permissions } = await import('@capacitor/core');

    const result = await Permissions.checkPermissions({
      permissions: ['storage'],
    });

    console.log('Check permissions result:', result.storage);
    return result.storage === 'granted';
  } catch (error) {
    console.error('Error checking permissions:', error);
    return false;
  }
};

export const openAppSettings = async (): Promise<void> => {
  try {
    if (typeof (window as any).Capacitor === 'undefined') {
      console.log('Not in Capacitor environment');
      alert('请在手机设置中手动授予存储权限');
      return;
    }

    const { Device } = await import('@capacitor/device');
    const info = await Device.getInfo();
    const osVersion = parseInt(info.osVersion) || 0;

    const { App } = await import('@capacitor/app');

    if (info.osName === 'android' && osVersion >= 11) {
      await App.openUrl({
        url: 'app-settings:',
      });
    } else {
      await App.openUrl({
        url: 'app-settings:',
      });
    }
  } catch (error) {
    console.error('Error opening settings:', error);
    alert('请在手机设置 > 应用 > 文件管理器 > 权限中授予存储权限');
  }
};
