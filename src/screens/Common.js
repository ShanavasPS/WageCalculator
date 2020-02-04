/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import { Alert } from "react-native";

export function showOKAlert(title, description) {
  Alert.alert(
    title,
    description,
    [{ text: "OK" }],
    { cancelable: false }
  );
};
