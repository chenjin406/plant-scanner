/**
 * Plant Scanner Native - Main Entry Point
 * React Native iOS/Android App
 */

import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';
import App from './src/App';

AppRegistry.registerComponent(appName, () => App);
AppRegistry.runApplication(appName, {
  rootTag: document.getElementById('root')
});
