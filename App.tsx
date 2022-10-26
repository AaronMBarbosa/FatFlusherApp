import React, { useState } from 'react'
import {StatusBar} from 'expo-status-bar'
import { Button, StyleSheet, View, Text, Alert } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DatePicker from 'react-native-date-picker'
import { Permission } from 'react-native-permissions';

import DeviceModal from './DeviceConnectionModal';
import useBLE from './useBLE'


function HomeScreen({ navigation }) {
  const[isModalVisible, setIsModalVisible] = useState<boolean>(false);
  const {requestPermissions} = useBLE();

  const hideModal = () => {
    setIsModalVisible(false);
  }

  const openModal = async () => {
    requestPermissions((isGranted: boolean)=>{
      alert('The permissions have been granted?' + isGranted);
    });
    //setIsModalVisible(true);
  }

  return (
    <View style={{ flex: 1,justifyContent: 'space-evenly', alignItems: 'center', textAlign: 'center', marginLeft: 30, marginRight: 30 }}>
      <Text style = {{textAlign: 'center'}} >Welcome to the Fat Flusher App! This application will allow you to interface with the vest and control the duration and temperature of the device. Please follow
        any and all warnings associated with this device!
      </Text>
      <Button
        title="Request Permissions"
        onPress={openModal}
      />
      <Button
        title="Start"
        onPress={() => navigation.navigate('Start')}
      />
      
    </View>
  );
}
function TempSet({ navigation }) {
  const [count, setCount] = React.useState(0);

  return (
    <View style={styles.container}>
      <Text style = {{textAlign: 'center'}} > Please enter your desired temperature for the procedure. The
        recommended temperature is around -10°C.</Text>
      <Text style = {{ fontSize: 60, marginBottom: -20}}>{count}°C</Text>
      <Text style = {{ fontSize: 12, padding: 20, color: 'grey'}}>Current Temperature Goal</Text>
      <StatusBar style = "auto" />
      <View style={{flexDirection: 'row'}}>
        <Button onPress={() => setCount(count - 1)} title = "-" />
        <Text>   </Text>
        <Button onPress={() => setCount(count + 1)} title = "+" />
      </View>
      <Button
        title="Set Temperature and Start pre-cooling  process!"
        onPress={() => navigation.navigate("Precool", {
          tempgoal: count,
        })}
        />
    </View>
  );
}

function Precool({ route, navigation }) {
  const tempgoal = route.params.tempgoal;
  const currenttemp = React.useState(0);
  const createTwoButtonAlert = () =>
    Alert.alert(
      "Desired Temperature Met",
      "Please put the vest device on and hit 'ok' when you are ready to start.",
      [
        {
          text: "Cancel",
          onPress: () => console.log("Cancel Pressed"),
          style: "cancel"
        },
        { text: "OK", onPress: () =>  {console.log("Ok Pressed"); navigation.navigate('LiveScreen')} }
      ]
    );

    return(
      <View style={styles.container}>
      <Text> Precooling period, Please wait...</Text>
      <Text style = {{ fontSize: 60, marginBottom: -20}}>{tempgoal}°</Text>
      <Text style = {{ fontSize: 12, padding: 20, color: 'grey'}}>Current Vest Temperature</Text>
      <Text style = {{textAlign: 'center'}} >You will be automatically alerted when the vest has reached the desired temperature.</Text>
      <Button title={"2-Button Alert"} onPress={createTwoButtonAlert} />
      </View>
    );
}

function LiveScreen({ route, navigation }) {
  //const timeleft = route.params.tempgoal;
  const currenttemp = React.useState(0);

    return(
      <View style={styles.container}>
      <Text style = {{textAlign: 'center'}} > This will be the main screen to see all of the live data being recieved via bluetooth...</Text>
      </View>
    );
}

// ... other code from the previous section
function StartScreen({navigation}) {
  const [date, setDate] = useState(new Date())
  const [open, setOpen] = useState(false)
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', marginLeft: 20, marginRight: 20 }}>
      <Text>Please what time you would like the procedure to </Text>
        <Text> end.</Text>
        <Text>    </Text>
      <Text> *WARNING* </Text>
      <Text>    </Text>
      <Text>
      The maxiumum recommented duration for this </Text>
      <Text> product is no longer than an hour. </Text>
      <Button title="Click to Set Time" onPress={() => setOpen(true)} />
      <DatePicker
        modal
        mode='time'
        open={open}
        date={date}
        onConfirm={(date) => {
          setOpen(false)
          setDate(date)
        }}
        onCancel={() => {
          setOpen(false)
        }}
      />
      <Text>Time Selected: {date.toLocaleString()}</Text>
      <Button title="Next" onPress={() => navigation.navigate('TempSet') }/>
    </View>
  );
}



const Stack = createNativeStackNavigator();

function App() {

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
      <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{
            title: 'My home',
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen
          name="Start"
          component={StartScreen}
          options={{
            title: 'Welcome!',
            headerStyle: {
              backgroundColor: '#f4511e',
            },
            headerTintColor: '#fff',
          }}
        />
        <Stack.Screen name="TempSet" component={TempSet} 
        options={{
          title: 'Set a desired temperature!',
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
        }}/>
        <Stack.Screen name="Precool" component={Precool} 
        options={{
          title: 'Pre Cool the Vest!',
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
        }}/> 
        <Stack.Screen name="LiveScreen" component={LiveScreen} 
        options={{
          title: 'Live Data',
          headerStyle: {
            backgroundColor: '#f4511e',
          },
          headerTintColor: '#fff',
        }}/> 
        
      </Stack.Navigator>
    </NavigationContainer>
  );
}


export default App;

const styles = StyleSheet.create({
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
  },
});