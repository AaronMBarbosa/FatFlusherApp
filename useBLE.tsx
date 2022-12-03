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
import globals from './globals';

const TEMP_DEV_UUID =       'AD8CD5B3-D11D-5296-828A-A39DE73293F9'
const TEMP_UUID =           '00000001-710e-4a5b-8d75-3e5b444bc3cf';
const TEMP_CHARACTERISTIC = '00000002-710e-4a5b-8d75-3e5b444bc3cf';
const TEMP_CHARA_UNITS =    '00000003-710e-4a5b-8d75-3e5b444b3c3f';

const bleManager = new BleManager();

type VoidCallback = (result: boolean) => void;

interface BluetoothLowEnergyApi {
  requestPermissions(cb: VoidCallback): Promise<void>;
  connectToDevice(device: Device): Promise<void>;
  scanForDevices(): void;
  currentDevice: Device | null;
  CurrTemp: number;
  allDevices: Device[];
}
function useBLE(): BluetoothLowEnergyApi {
    const [allDevices, setAllDevices] = useState<Device[]>([]);
    const [currentDevice, setConnectedDevice] = useState<Device | null>(null);
    const [CurrTemp, SetCurrTemp] = useState(0);


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
            if(device && device.name?.includes('Aaron')) {
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
const connectToDevice = async (device: Device) => {
  try {
    const deviceConnection = await bleManager.connectToDevice(device.id);
    setConnectedDevice(deviceConnection);
    bleManager.stopDeviceScan();
    await deviceConnection.discoverAllServicesAndCharacteristics(); 
    console.log("STREAMING DATA NOW!!!")
    startStreamingData(device);
    
  } catch(e) {
    console.log("Error with connection attempt! ", e);
  }

};

const startStreamingData = async (device: Device) => {
    console.log("I have started looking for data from the target device " + device.name);
    // I will have to come back to this section to put the correct IDs for streaming data
    device.monitorCharacteristicForService(
    TEMP_UUID,
    TEMP_CHARACTERISTIC,
    (error, characteristic) => onTempUpdate(error, characteristic),
    ); 
}; 


const onTempUpdate = (
  error: BleError | null,
  characteristic: Characteristic | null,
) => {
  console.log("I have been summonded to update.")
  if(error) {
    console.error(error);
    return;
  } //else if (characteristic?.value) {
  //   console.log("No Data RECIEVED!!!!!");
  //   return;
  // }
  console.log(atob(characteristic.value));
  const rawData = atob(characteristic.value);
  let stringTemp = rawData;
  stringTemp = stringTemp.replace('F', '')
  var numTemp = parseInt(stringTemp)
  numTemp = Number(((numTemp - 32) * (5/9)).toPrecision(3))
  console.log(numTemp + " Degrees Celcius")

  // if (firstbitValue === 0) {
  //   innerTemp = rawData[1].charCodeAt(0);
  // } else {
  //   innerTemp = Number(rawData[1].charCodeAt(0) << 8) + 
  //   rawData[2].charCodeAt(0)
  // }

  globals.RealTimeTemp = numTemp;
  SetCurrTemp(numTemp);
};

return { 
    requestPermissions,
    connectToDevice,
    scanForDevices,
    currentDevice,
    CurrTemp,
    allDevices,
  };
}

export default useBLE;