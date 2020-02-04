/**
 * Monthly Wage App
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

export function getTopBar(title) {
  return {
    topBar: {
      backButton: {
        color: 'gold'
      },
      visible: true,
      title: {
        text: title,
        fontSize: 18
      },
      background: {
        color: '#DF6E57'
      }
    }
  };
}

export function getHeader(title) {
  return {
    topBar: {
      visible: false,
      title: {
        text: title,
        fontSize: 18
      },
      background: {
        color: '#DF6E57'
      }
    }
  };
}