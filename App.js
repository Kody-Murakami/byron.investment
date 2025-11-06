// App.js
import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'react-native';
import Feather from 'react-native-vector-icons/Feather';

// 🔹 carrega a fonte dos ícones Feather (RN CLI)
Feather.loadFont();

import Login from './src/pages/Login';
import Cadastro from './src/pages/Cadastro';
import Home from './src/pages/Home';
import NovoInvestimento from './src/pages/NovoInvestimento';
import EditarInvestimento from './src/pages/EditarInvestimento';

const Stack = createStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar backgroundColor="#0D202B" barStyle="light-content" />
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Login" component={Login} />
        <Stack.Screen name="Cadastro" component={Cadastro} />
        <Stack.Screen name="Home" component={Home} />
        <Stack.Screen name="NovoInvestimento" component={NovoInvestimento} />
        <Stack.Screen name="EditarInvestimento" component={EditarInvestimento} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
