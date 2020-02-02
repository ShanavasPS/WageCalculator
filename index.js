/**
 * @format
 */

import { Navigation } from "react-native-navigation";
import { goToLandingScreen } from "./navigation"; 

Navigation.events().registerAppLaunchedListener(() => {
  goToLandingScreen();
});
