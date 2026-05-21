package com.filemanager.app;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate() {
        super.onCreate();
        try {
            registerPlugin(StoragePermissionPlugin.class);
        } catch (Exception e) {
            // Plugin may already be registered after cap sync
        }
    }
}
