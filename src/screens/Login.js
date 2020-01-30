/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from 'react';
import { Navigation } from 'react-native-navigation';
import { View, Text, TextInput, Button, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import { goToTabs } from '../../navigation';
import type { Person } from '../../types'

var RNFS = require('react-native-fs');

export default class Login extends Component {

  static get options() {
    return {
      topBar: {
        visible: false,
        title: {
          text: 'Login'
        }
      }
    };
  }

  state = {
    username: ''
  }


  render() {
    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>

          <View style={styles.main}>
            <View style={styles.fieldContainer}>
              <Text style={styles.label}>Enter your username</Text>
              <TextInput
                onChangeText={username => this.setState({ username })}
                style={styles.textInput}
              />
            </View>

            <Button title="Login" color="#0064e1" onPress={this.login} />
            <Button title="Read File" color="#0064e1" onPress={this.readFile} />

            <TouchableOpacity onPress={this.goToForgotPassword}>
              <View style={styles.center}>
                <Text style={styles.link_text}>Forgot Password</Text>
              </View>
            </TouchableOpacity>

          </View>
        </View>
      </View>
    );
  }

  //
  login = async () => {
    const { username } = this.state;
    if (username) {
      await AsyncStorage.setItem('username', username);
      goToTabs(global.icons, username);
    }
  }

  //
  readFile = async () => {
    console.log(RNFS.MainBundlePath);
    // get a list of files and directories in the main bundle
    RNFS.readDir(RNFS.MainBundlePath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then((result) => {
        console.log('GOT RESULT', result.length);
      })
      .catch((err) => {
        console.log(err.message, err.code);
        console.log('Failed to read directory');
      });
      
      RNFS.readFile(RNFS.MainBundlePath + '/HourList201403.csv', 'utf8')
      .then((contents) => {
        // log the file contents
        // console.log(contents);
        var myArray = contents.split('/n');
        console.log(myArray)
        var array = myArray.map
      })
      .catch((err) => {
        console.log(err.message, err.code);
        console.log('Failed to read file');
      });

  }

  goToForgotPassword = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: 'ForgotPasswordScreen',
      }
    });
  }

}
//

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20
  },
  fieldContainer: {
    marginTop: 20
  },
  label: {
    fontSize: 16
  },
  textInput: {
    height: 40,
    marginTop: 5,
    marginBottom: 10,
    borderColor: "#ccc",
    borderWidth: 1,
    backgroundColor: "#eaeaea",
    padding: 5
  },
  link_text: {
    color: '#2e45ec'
  },
  center: {
    alignSelf: 'center',
    marginTop: 10
  }
});
