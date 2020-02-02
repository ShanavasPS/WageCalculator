/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

// src/screens/Loading.js
import React, { Component } from "react";
import { View, Text, ActivityIndicator, StyleSheet } from "react-native";

import { goToLogin } from "../../navigation"; // import the functions for loading either the login screen or the tabs screen (shows home screen by default)

import AsyncStorage from "@react-native-community/async-storage";

export default class Loading extends Component {
  async componentDidMount() {
    goToLogin();
  }

  render() {
    // show loading indicator
    return (
      <View style={[styles.container, styles.horizontal]}>
        <Text>Hello</Text>
        <ActivityIndicator size="large" color="red" />
      </View>
    );
  }
}
//

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    color: 'red'
  },
  horizontal: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    color: 'red'
  }
})