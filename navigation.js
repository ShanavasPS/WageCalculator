/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import { Navigation } from "react-native-navigation";

import Login from "./src/screens/Login";
import Home from "./src/screens/Home";

Navigation.registerComponent(`LoginScreen`, () => Login);
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
              name: "LoginScreen"
            }
          }
        ]
      }
    }
  });

  const iconColor = "#444";
const selectedIconColor = "#0089da";

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