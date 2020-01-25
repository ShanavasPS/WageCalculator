/**
 * @format
 */

import { Navigation } from "react-native-navigation";
import Icon from "react-native-vector-icons/FontAwesome";

import Loading from "./src/screens/Loading"; // the loading screen

import "./loadIcons"; // file for loading the icons to be used in the bottom tab navigation

Navigation.registerComponent(`LoadingScreen`, () => Loading);

Navigation.events().registerAppLaunchedListener(() => {
  // set the root component
  Navigation.setRoot({
    root: {
      component: {
        name: "LoadingScreen"
      }
    }
  });
});
