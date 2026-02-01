/**
 * @format
 */

import 'react-native-gesture-handler';
import { AppRegistry } from 'react-native';
import { enableScreens } from 'react-native-screens';
import App from './App';
import { name as appName } from './app.json';

// 启用原生屏幕容器
enableScreens();

AppRegistry.registerComponent(appName, () => App);
