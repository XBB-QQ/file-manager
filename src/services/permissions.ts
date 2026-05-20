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

    console.log('Storage permission denied:', storagePermission);
    return false;
  } catch (error) {
    console.error('Error requesting permissions:', error);
    return false;
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

    const { App } = await import('@capacitor/app');
    await App.openUrl({
      url: 'app-settings:',
    });
  } catch (error) {
    console.error('Error opening settings:', error);

    try {
      const { App } = await import('@capacitor/app');
      await App.openUrl({
        url: 'package:com.filemanager.app',
      });
    } catch (e) {
      console.error('Failed to open settings via fallback');
      alert('请在手机设置 > 应用 > 文件管理器 > 权限中授予存储权限');
    }
  }
};