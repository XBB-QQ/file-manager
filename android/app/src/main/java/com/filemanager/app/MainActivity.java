package com.filemanager.app;

import android.os.Bundle;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            registerPlugin(StoragePermissionPlugin.class);
        } catch (Exception e) {
            // Plugin may already be registered after cap sync
        }
    }
}