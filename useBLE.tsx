import {useState} from 'react';
import {PermissionsAndroid, Platform} from 'react-native';
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
} from 'react-native-ble-plx';
import {check, PERMISSIONS, request, requestMultiple, RESULTS} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

import {atob} from 'react-native-quick-base64';

const bleManager = new BleManager();

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  scanForDevices(): void;
  allDevices: Device[];
}

export default function useBLE(): BluetoothLowEnergyApi {
    const [allDevices, setAllDevices] = useState<Device[]>([]);


  const requestPermissions = async (cb: VoidCallback) => {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isGranted =
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {
      try {
      const result = await request(PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL)
      switch (result) {
        case RESULTS.UNAVAILABLE:
          console.log('Bluetooth is not avaliable or is unsupported on this device.');
          cb(false)
          break;
        case RESULTS.DENIED:
          console.log('The Bluetooth permissions have been denied by the device or user.');
          cb(false)
          break;
        case RESULTS.LIMITED:
          console.log('The Bluetooth permissions given are limited, some items may not work as expected.');
          cb(false)
          break;
        case RESULTS.GRANTED:
          console.log('The Bluetooth permissions have succesfully been granted.');
          cb(true)
          break;
        case RESULTS.BLOCKED:
          console.log('The Bluetooth permissions have been denied.')
          cb(false)
          break
      }
     } catch (error) {
        console.log('The Bluetooth permissions request failed with error: ' + error)
        cb(false);
      }
    }
  };

    const isDuplicateDevice = (devices: Device[], nextDevice: Device) => 
        devices.findIndex(device => nextDevice.id === device.id) > -1;

    const scanForDevices =  () => {
        bleManager.startDeviceScan(null, null, (error, device) => {
            if(error) {
                console.log(error);
            }
            if(device) {
                // Add Device
                setAllDevices((prevState) => {
                    if(!isDuplicateDevice(prevState,device)) {
                        return [...prevState, device];
                    }
                    return prevState;
                });
            }
        });
    } 

return {
    requestPermissions,
    scanForDevices,
    allDevices,
  };
}

