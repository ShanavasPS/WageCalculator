/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import { Navigation } from "react-native-navigation";

import Landing from "./src/screens/Landing";
import Home from "./src/screens/Home";

Navigation.registerComponent(`LandingScreen`, () => Landing);
Navigation.registerComponent(`HomeScreen`, () => Home);

export const goToLogin = () =>
  Navigation.setRoot({
    root: {
      stack: {
        // create a stack navigation
        id: "stackMain",
        children: [
          {
            component: {
              name: "LandingScreen"
            }
          }
        ]
      }
    }
  });

 export const goToHome = (wageArray, fileHeader) =>
  Navigation.setRoot({
    root: {
      stack: {
        // create a stack navigation
        id: "stackHome",
        children: [
          {
            component: {
              name: "HomeScreen",
              passProps: {
                wageArray,
                fileHeader,
              }
            }           
          }
        ]
      }
    }
  });