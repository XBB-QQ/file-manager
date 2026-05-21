  deleteSelected: async () => {
    const { selectedFiles, files, currentPath } = get();
    const selectedFileItems = files.filter(f => selectedFiles.has(f.id));
    
    for (const file of selectedFileItems) {
      await deleteFileOrFolder(currentPath, file.name);
    }

    await get().loadFiles(currentPath);
    set({ selectedFiles: new Set(), isMultiSelect: false });
  },

  copyFiles: async () => {
    const { selectedFiles, files } = get();
    const selectedFileItems = files.filter(f => selectedFiles.has(f.id));
    set({ 
      clipboard: { type: 'copy', files: selectedFileItems }, 
      selectedFiles: new Set(), 
      isMultiSelect: false 
    });
  },

  cutFiles: async () => {
    const { selectedFiles, files } = get();
    const selectedFileItems = files.filter(f => selectedFiles.has(f.id));
    set({ 
      clipboard: { type: 'cut', files: selectedFileItems }, 
      selectedFiles: new Set(), 
      isMultiSelect: false 
    });
  },

  pasteFiles: async () => {
    const { clipboard, currentPath } = get();
    if (clipboard.files.length === 0) return;

    set({ isLoading: true });
    
    try {
      for (const file of clipboard.files) {
        const destPath = currentPath === '/' ? `/${file.name}` : `${currentPath}/${file.name}`;
        
        if (clipboard.type === 'copy') {
          await copyFile(file.path, destPath);
        } else if (clipboard.type === 'cut') {
          await moveFile(file.path, destPath);
        }
      }
      
      set({ clipboard: { type: null, files: [] } });
      await get().loadFiles(currentPath);
    } catch (error) {
      console.error('Error pasting files:', error);
    } finally {
      set({ isLoading: false });
    }
  },