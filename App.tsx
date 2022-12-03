import React, { useState } from 'react'
import { StyleSheet, View, Text, Alert, TouchableOpacity, Vibration } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DatePicker from 'react-native-date-picker'
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'
import DeviceModal from './DeviceConnectionModal';
import useBLE from './useBLE'
import { Device } from 'react-native-ble-plx';
import { useElapsedTime } from 'use-elapsed-time';
import globals from './globals';



function HomeScreen({ navigation }) {
  const[isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const {requestPermissions} = useBLE();

  const hideModal = () => {
    setIsModalVisible(false);
  }

  const openModal = async () => {
    requestPermissions((isGranted: boolean)=>{
      alert('The permissions have been granted? ' + isGranted);
    });
    //setIsModalVisible(true);
  }

  return (
    <View style={{ flex: 1,justifyContent: 'space-evenly', alignItems: 'center', textAlign: 'center', fontSize: 24, marginLeft: 15, marginRight: 15 }}>
      <Text style = {styles.title} >Welcome to the Fat Flusher App! This application will allow you to interface with the vest and control the duration and temperature of the device. Please follow 
      all warnings & directions associated with this device!
      </Text>
      <TouchableOpacity onPress={openModal} style={styles.ctaButton}>
        <Text style = {styles.ctaButtonText}>{'  Bluetooth Test  '}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>navigation.navigate('ConnectScreen')} style={styles.ctaButton}>
        <Text style = {styles.ctaButtonText}>{'  Start!  '}</Text>
      </TouchableOpacity>
      
    </View>
  );
}

function ConnectScreen({ navigation }) {
  const[isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const {requestPermissions,
         connectToDevice,
         scanForDevices,
         currentDevice,
         CurrTemp,
         allDevices} = useBLE();

  const hideModal = () => {
    setIsModalVisible(false);
  }

  //add a check here to ensure the correct device is connected once we have the MCU 
  //bluetooth communication completed

  const openModal = async () => {
    requestPermissions((isGranted: boolean)=>{
      if(isGranted){
        scanForDevices();
        setIsModalVisible(true);
      }
    });
    //setIsModalVisible(true);
  }

  return (
    <View style={{ flex: 1,justifyContent: 'space-evenly', alignItems: 'center', textAlign: 'center', fontSize: 24, marginLeft: 30, marginRight: 30 }}>
      <Text style = {{textAlign: 'center', fontSize: 24}} >Please connect to the vest device via bluetooth.
      </Text>
      {allDevices.map((device: Device) => (
        <Text></Text>
      ))}
      <TouchableOpacity onPress={openModal} style={styles.ctaButton}>
        <Text style = {styles.ctaButtonText}>{'  Connect  '}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={()=>navigation.navigate("Start", {
          CurrTemp: CurrTemp,
        })} style={styles.ctaButton}>
        <Text style = {styles.ctaButtonText}>{'  Next  '}</Text>
      </TouchableOpacity>
      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
        />  
    </View>
  );
}

function TempSet({route, navigation }) {
  const [count, setCount] = React.useState(0);
  const timegoal = route.params.timegoal;
  const CurrTemp = useState(route.params.CurrTemp);

  return (
    <View style={styles.container}>
      <Text style = {{textAlign: 'center', fontSize:20}} > Please enter your desired temperature for the procedure. The
        recommended temperature is around -10°C.</Text>
      <Text style = {{ fontSize: 60, marginBottom: -20}}>{count}°C</Text>
      <Text style = {{ fontSize: 12, padding: 20, color: 'grey'}}>Current Temperature Goal</Text>
      
      <View style={{flexDirection: 'row'}}>
      <TouchableOpacity onPress={()=>{setCount(count - 1); if (count <= -12) {
        Alert.alert(
          "WARNING!",
          "The current temperature is too low and is not safe for extended periods. Please increase the selected temperature.",
          [
            { text: "Okay!", onPress: () =>  {console.log("Ok Pressed"); setCount(count+1)} }
          ]
        );
      }}} style={styles.ctaButton}>
        <Text style = {styles.ctaButtonText}>{'    -    '}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={()=>{setCount(count + 1);if (count >= 22) {
        Alert.alert(
          "WARNING!",
          "The current temperature is too high for the vest. Please lower the selected temperature.",
          [
            { text: "Okay!", onPress: () =>  {console.log("Ok Pressed"); setCount(count-1)} }
          ]
        );
      }}} style={styles.ctaButton}>
        <Text style = {styles.ctaButtonText}>{'    +    '}</Text>
      </TouchableOpacity>
      </View>

      <TouchableOpacity onPress={()=>navigation.navigate("Precool", {
          tempgoal: count,
          timegoal: timegoal,
          CurrTemp: CurrTemp,
        })} style={styles.ctaButton}>
        <Text style = {styles.ctaButtonText}>{' Set and Start Pre-Cool! '}</Text>
      </TouchableOpacity>
    </View>
  );
}


function Precool({ route, navigation }) {
  const tempgoal = route.params.tempgoal;
  const timegoal = route.params.timegoal;
  const currenttemp = React.useState(0);


  const [CurrTemp, setCurrentTemp] = useState(globals.RealTimeTemp);
  const [isPlaying, setisPlaying] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [minutes, setminute] = useState(0);
  const { elaspedTime } = useElapsedTime ({isPlaying, updateInterval: 1, onUpdate: (time) => {console.log(``); 
  
  if(seconds == 60) {
    setminute(minutes + 1);
    setCurrentTemp(globals.RealTimeTemp); 
    setSeconds(0);
  } else {
    setSeconds(seconds + 1);
    setCurrentTemp(globals.RealTimeTemp); 
  }

  }});
  const createTwoButtonAlert = () =>
    Alert.alert(
      "Desired Temperature Met",
      "Please put the vest device on and hit 'ok' to start the timer.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () =>  {console.log("Ok Pressed"); setisPlaying(false);navigation.navigate('LiveScreen', {
          tempgoal: tempgoal,
          timegoal: timegoal
        })} }
      ]
    );
    return(
      <View style={styles.container}>
      <Text> Precooling period, Please wait...</Text>
      
      <Text style = {{ fontSize: 60, marginBottom: -20}}>{CurrTemp}°C</Text>
      <Text style = {{ fontSize: 12, padding: 20, color: 'grey'}}>Current Vest Temperature</Text>
      <Text style = {{fontSize: 24, textAlign : 'center'}}>Time Elapsed:</Text>
      <Text style = {{fontSize: 16, textAlign : 'center'}}>{minutes} minutes and {seconds} seconds</Text>
      <Text></Text>
      <Text style = {{textAlign: 'center', fontSize: 14}} >You will be automatically alerted when the vest has reached the desired temperature.</Text>
      <Text></Text>
      <Text></Text>
      <TouchableOpacity onPress={createTwoButtonAlert} style={styles.ctaButton}>
        <Text style = {styles.ctaButtonText}>{'Temp "Next"'}</Text>
      </TouchableOpacity>
      </View>
    );
}

function LiveScreen({ route, navigation }) {
  const temptime = route.params.timegoal - 1;
  var timeleft = temptime;
  const [times, settime] = useState(timeleft)
  var repeat = true;
  var CurrTemp = globals.RealTimeTemp;
  const [stateTemp, setstateTemp] = useState(CurrTemp);
  const ONE_SECOND_IN_MS = 1000;
  const PATTERN = [
    1 * ONE_SECOND_IN_MS,
    1.05 * ONE_SECOND_IN_MS,
    0.1 * ONE_SECOND_IN_MS
  ];
  
  // const [isPlaying, setisPlaying] = useState(true);
  // const { elaspedTime } = useElapsedTime ({isPlaying, updateInterval: 5, onUpdate: (timeleft) => { 
  //   setstateTemp(globals.RealTimeTemp); 
  // }});
    return(
      <View style={styles.container}>
        <CountdownCircleTimer 
        isPlaying
        duration={3}
        colors={['#fa6e6e', '#ff765a', '#ff8342', '#ff9323', '#fca500', '#ebb800', '#d3cb00', '#84ef00', '#18ff00']}
        colorsTime={[60, 50, 40, 30, 20, 10, 5, 0]}
        isSmoothColorTransition={true}
        updateInterval={0}
        onUpdate={() => {
          setstateTemp(CurrTemp)
        }}
        onComplete={() => {
          CurrTemp = globals.RealTimeTemp;
          if(timeleft > 0) {
          timeleft = timeleft - 1;
          repeat = true;
          } else if (timeleft <= 0){
            timeleft = 0;
            console.log("Procedure End!");
            repeat = false;
           
            Vibration.vibrate(PATTERN,true);
            
            Alert.alert(
              "Procedure is Complete!",
              "Please remove the vest and take some time to warm up! You may also close the application at this time.",
              [
                { text: "Okay!", onPress: () =>  {console.log("Ok Pressed");Vibration.cancel(); navigation.navigate('Home')} }
              ] 
            )
          }
          return {shouldRepeat: repeat, delay: 0.2}
        }}
    
      >
      {({remainingTime}) => <Text style = {{textAlign: 'center', fontSize: 16}}> {timeleft} Minutes {remainingTime} seconds remaining</Text>
      }
      </CountdownCircleTimer>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text style = {{textAlign: 'center'}} >Current Vest Temperature:</Text>
      <Text style = {{ textAlign:'center',fontSize: 60, marginBottom: -20}}>{stateTemp}°C</Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>
      <Text></Text>

      <Text style = {{textAlign: 'center'}} > This is the main screen to see any/all of the live data being received via bluetooth...</Text>
      </View>
    );
}

// ... other code from the previous section
function StartScreen({route ,navigation}) {
  const [date, setDate] = useState(new Date())
  const [open, setOpen] = useState(false)
  const [tempdate, settempDate] = useState(new Date())
  const CurrTemp = route.params.CurrTemp;
  var temphour = tempdate.getHours();
  var tempmin = tempdate.getMinutes();
  var timeset = 1;
  const [goodval, setgoodval] = useState(false);
  timeset = (date.getHours()-temphour)*60 + (date.getMinutes()-tempmin);
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 20, marginRight: 20 , fontSize:20}}>
      <Text style ={{ textAlign: 'center' ,fontSize:20 }}>Please what time you would like the procedure to end.</Text>
        <Text>    </Text>
      <Text style ={{ textAlign: 'center' ,fontSize:26 }}> *WARNING* </Text>
      <Text>    </Text>
      <Text>
      The maximum recommended duration for this </Text>
      <Text> product is no longer than an hour. </Text>
      <Text> </Text>
      <TouchableOpacity onPress={() => setOpen(true)} style={styles.ctaButton}>
        <Text style = {styles.ctaButtonText}>{' Set Duration '}</Text>
      </TouchableOpacity>
      <DatePicker
        modal
        mode='time'
        open={open}
        date={date}
        onConfirm={(date) => {
          setOpen(false)
          setDate(date)
          timeset = (date.getHours()-temphour)*60 + (date.getMinutes()-tempmin);
          if (timeset <= 0) {
            Alert.alert(
              "Duration must be greater than 0!",
              "The selected time must be longer than 0 minutes!",
              [ 
                {
                text: "Okay",
                onPress:() => setgoodval(false),
              }
              ]
            );
          } else if (timeset <= 120) {
            setgoodval(true);
          } else {
            Alert.alert(
              "Duration is too long!",
              "The selected time is much longer than what is considered safe. Please adjust the time set.",
              [ 
                {
                text: "Okay",
                onPress:() => setgoodval(false),
              }
              ]
            );
          }
        }}
        onCancel={() => {
          setOpen(false)
          setgoodval(false)
        }}
      />
      <Text> </Text>
      <Text>Current time: {tempdate.toLocaleTimeString()}</Text>
      <Text>Duration Selected: {timeset} minutes</Text>
      <Text> </Text>

      <TouchableOpacity onPress={()=>{console.log("Next Pressed"); if(goodval == true) {
      navigation.navigate('TempSet', {
          timegoal: timeset,
          CurrTemp: CurrTemp,
        }) } else {
          Alert.alert(
            "Please enter a valid time duration",
            "The current duration for the procedure is either too long or not a valid time length.",
            [ 
              {
              text: "Okay",
              onPress:() => setgoodval(false),
            }
            ]
          );
        }
      }} style={styles.ctaButton}>
        <Text style = {styles.ctaButtonText}>{' Next! '}</Text>
        </TouchableOpacity>
      
    </View>
  );
}



const Stack = createNativeStackNavigator();

function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
      <Stack.Screen name="ConnectScreen" component={ConnectScreen} 
        options={{
          title: 'Connect to a Device',
          headerStyle: {
            backgroundColor: '#800000',
          },
          headerTintColor: '#fff',
        }}/>
      <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'Welcome to Fat Flusher',
            headerStyle: {
              backgroundColor: '#800000',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Start"
          component={StartScreen}
          options={{
            title: 'Set Time',
            headerStyle: {
              backgroundColor: '#800000',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen name="TempSet" component={TempSet} 
        options={{
          title: 'Set a desired temperature!',
          headerStyle: {
            backgroundColor: '#800000',
          },
          headerTintColor: '#fff',
        }}/>
        <Stack.Screen name="Precool" component={Precool} 
        options={{
          title: 'Pre Cool the Vest!',
          headerStyle: {
            backgroundColor: '#800000',
          },
          headerTintColor: '#fff',
        }}/> 
        <Stack.Screen name="LiveScreen" component={LiveScreen} 
        options={{
          title: 'Live Data',
          headerStyle: {
            backgroundColor: '#800000',
          },
          headerTintColor: '#fff',
        }}/> 
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App;

const styles = StyleSheet.create({
  parent:{
    flex: 1,
    backgroundColor: 'maroon',
  },
  container: {
    flex: 1,
    padding: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    textAlign: 'center',
    fontSize: 20,
    fontWeight: 'bold',
    padding: 20,
  },modalContainer: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  modalFlatlistContiner: {
    flex: 1,
    justifyContent: 'center',
  },
  modalCellOutline: {
    borderWidth: 1,
    borderColor: 'black',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 8,
  },
  modalTitle: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  modalTitleText: {
    marginTop: 40,
    fontSize: 30,
    fontWeight: 'bold',
    marginHorizontal: 20,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: 'maroon',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 30,
    marginBottom: 5,
    borderRadius: 8,
  },
  ctaButtonText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: 'white',
  },
});