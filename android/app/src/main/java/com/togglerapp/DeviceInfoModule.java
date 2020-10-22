//DeviceInfoModule.java
package com.togglerapp;
 
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.uimanager.IllegalViewOperationException;
import com.facebook.react.bridge.Callback;
import android.app.PendingIntent;
import android.content.Intent;
import android.provider.Settings.Secure;
import android.content.Context;
import com.facebook.react.bridge.Promise;
import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;
import android.os.AsyncTask;
import android.os.Build;
import android.net.wifi.WifiManager;
import android.net.wifi.WifiInfo;
import android.content.pm.PackageManager;
import android.Manifest;

import java.net.InetAddress;
import java.net.NetworkInterface;
import java.net.SocketException;
import java.net.UnknownHostException;
 
public class DeviceInfoModule extends ReactContextBaseJavaModule {
 
    public DeviceInfoModule(ReactApplicationContext reactContext) {
        super(reactContext); //required by React Native
    }
 
    @Override
    //getName is required to define the name of the module represented in JavaScript
    public String getName() { 
        return "DeviceInfoGet";
    }

    @ReactMethod
    public void getDeviceID(final Callback callback) {
        getDeviceIDHandler(callback);
    }

    private void getDeviceIDHandler(final Callback callback) {
        AsyncTask<Void,Void,Void> myAsyncTask = new AsyncTask<Void,Void,Void>() {
            @Override
            protected Void doInBackground(final Void ... params) {
                Context context = getReactApplicationContext();
                String android_id = Secure.getString(context.getContentResolver(), Secure.ANDROID_ID);
                callback.invoke(null, android_id);
                return null;
            }
        };
        myAsyncTask.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }

    @ReactMethod
    public void getDeviceName(final Callback callback) {
        getDeviceNameHandler(callback);
    }

    private void getDeviceNameHandler(final Callback callback) {
        AsyncTask<Void,Void,Void> myAsyncTask = new AsyncTask<Void,Void,Void>() {
            @Override
            protected Void doInBackground(final Void ... params) {
                String deviceName = Build.MANUFACTURER;
                callback.invoke(null, deviceName);
                return null;
            }
        };
        myAsyncTask.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }

    @ReactMethod
    public void getMac(final Callback callback) {
        getMacHandler(callback);
    }

    private void getMacHandler(final Callback callback) {
        AsyncTask<Void,Void,Void> myAsyncTask = new AsyncTask<Void,Void,Void>() {
            @Override
            protected Void doInBackground(final Void ... params) {
                String macAddress = null;
                Context context = getReactApplicationContext();
                PackageManager pm=context.getPackageManager();
                if (PackageManager.PERMISSION_GRANTED == pm.checkPermission(Manifest.permission.ACCESS_WIFI_STATE,context.getPackageName())) {
                    WifiManager wifiMan=(WifiManager)context.getSystemService(Context.WIFI_SERVICE);
                    WifiInfo wifiInf=wifiMan.getConnectionInfo();
                    macAddress=wifiInf.getMacAddress();
                }
                callback.invoke(null, macAddress);
                return null;
            }
        };
        myAsyncTask.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }

    @ReactMethod
    public void getIP(final Callback callback) {
        getIPHandler(callback);
    }

    private void getIPHandler(final Callback callback) {
        AsyncTask<Void,Void,Void> myAsyncTask = new AsyncTask<Void,Void,Void>() {
            @Override
            protected Void doInBackground(final Void ... params) {
                int iPAddress = 0;
                Context context = getReactApplicationContext();
                PackageManager pm=context.getPackageManager();
                if (PackageManager.PERMISSION_GRANTED == pm.checkPermission(Manifest.permission.ACCESS_WIFI_STATE,context.getPackageName())) {
                    WifiManager wifiMan=(WifiManager)context.getSystemService(Context.WIFI_SERVICE);
                    WifiInfo wifiInf=wifiMan.getConnectionInfo();
                    iPAddress=wifiInf.getIpAddress();
                }
                callback.invoke(null, iPAddress);
                return null;
            }
        };
        myAsyncTask.executeOnExecutor(AsyncTask.THREAD_POOL_EXECUTOR);
    }
}
