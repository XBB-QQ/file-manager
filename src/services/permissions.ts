import StoragePermission from './storagePermissionPlugin';

let isRequesting = false;

async function tryReadStorage(): Promise<boolean> {
  try {
    const { Filesystem, Directory } = await import('@capacitor/filesystem');
    await Filesystem.readdir({ path: '', directory: Directory.ExternalStorage });
    return true;
  } catch {
    return false;
  }
}

async function isAndroid(): Promise<boolean> {
  if (typeof (window as any).Capacitor === 'undefined') return false;
  const { Capacitor } = await import('@capacitor/core');
  return Capacitor.getPlatform() === 'android';
}

export const requestStoragePermissions = async (): Promise<boolean> => {
  if (isRequesting) return false;
  isRequesting = true;

  try {
    const canRead = await tryReadStorage();
    if (canRead) {
      isRequesting = false;
      return true;
    }

    const android = await isAndroid();
    if (!android) {
      isRequesting = false;
      return false;
    }

    try {
      await StoragePermission.requestManageExternalStorage();
    } catch {
      isRequesting = false;
      return false;
    }

    const canReadNow = await tryReadStorage();
    isRequesting = false;
    return canReadNow;
  } catch (error) {
    console.error('Error in requestStoragePermissions:', error);
    isRequesting = false;
    return false;
  }
};

export const checkStoragePermissions = async (): Promise<boolean> => {
  return tryReadStorage();
};