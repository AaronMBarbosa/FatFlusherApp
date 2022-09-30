import React, { useState } from 'react'
import DatePicker from 'react-native-date-picker'
import { Button, StyleSheet,View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CountdownCircleTimer } from 'react-native-countdown-circle-timer'

function HomeScreen({ navigation }) {
  return (
    <View style={{ flex: 1,justifyContent: 'space-evenly', alignItems: 'center', textAlign: 'center', marginLeft: 30, marginRight: 30 }}>
      <Text>Welcome to the Fat Flusher App! This application will allow you to interface with the vest and control the duration and temperature of the device. Please follow
        any and all warnings associated with this device!
      </Text>
      <Button
        title="Start"
        onPress={() => navigation.navigate('Start')}
      />
    </View>
  );
}
function TempSet({ navigation }) {
  return (
    <View style={{ flex: 1,justifyContent: 'space-evenly', alignItems: 'center', textAlign: 'center', marginLeft: 30, marginRight: 30 }}>
      <Text> This is where the user can set their temperature for the procedure.
      </Text>
      <Button
        title="Start"
        onPress={() => navigation.navigate('Start')}
      />
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
      <Button title="Next" onPress={() => navigation.navigate('TempSet') }/>
      <DatePicker
        model
        mode="time"
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
        <Stack.Screen name="TempSet" component={TempSet} />
        
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