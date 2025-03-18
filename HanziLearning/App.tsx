/**
 * 视障人士汉字书写学习应用
 */

import React from 'react';
import { StatusBar, useColorScheme } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// 导入页面组件
import { HomeScreen, ProfileScreen, CharactersScreen, SignatureScreen, StrokesScreen } from './src/screens';

// 定义导航参数类型
type RootStackParamList = {
  Home: undefined;
  Profile: undefined;
  Strokes: undefined;
  Characters: undefined;
  Signature: undefined;
};

// 创建导航栈
const Stack = createNativeStackNavigator<RootStackParamList>();

function App(): React.JSX.Element {
  const isDarkMode = useColorScheme() === 'dark';

  return (
    <NavigationContainer>
      <StatusBar
        barStyle={isDarkMode ? 'light-content' : 'dark-content'}
        backgroundColor={isDarkMode ? '#000' : '#fff'}
      />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Profile" component={ProfileScreen} />
        <Stack.Screen name="Strokes" component={StrokesScreen} />
        <Stack.Screen name="Characters" component={CharactersScreen} />
        <Stack.Screen name="Signature" component={SignatureScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default App;
