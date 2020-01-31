/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Navigation } from "react-native-navigation";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";

import { goToTabs } from "../../navigation";
import type { Person, PersonWithWorkTime } from "../../types";

var RNFS = require("react-native-fs");

export default class Login extends Component {
  static get options() {
    return {
      topBar: {
        visible: false,
        title: {
          text: "Login"
        }
      }
    };
  }

  state = {
    username: ""
  };

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
      await AsyncStorage.setItem("username", username);
      goToTabs(global.icons, username);
    }
  };

  //
  readFile = async () => {
    // console.log(RNFS.MainBundlePath);
    // get a list of files and directories in the main bundle
    RNFS.readDir(RNFS.MainBundlePath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then(result => {
        // console.log('GOT RESULT', result.length);
      })
      .catch(err => {
        // console.log(err.message, err.code);
        console.log("Failed to read directory");
      });

    RNFS.readFile(RNFS.MainBundlePath + "/HourList201403.csv", "utf8")
      .then(contents => {
        // log the file contents
        // console.log(contents);
        var myArray = contents.split("\n");
        let finalArray: [Person] = myArray.map(item => {
          let newArray = item.split(",");
          return (Person = {
            name: newArray[0],
            id: newArray[1],
            date: newArray[2],
            start: newArray[3],
            end: newArray[4]
          });
        });
        // this.calculateHourAndMinute(finalArray);
        // this.getEveningHoursAndMinutes(19, 15, 22, 30, 3, 15);
        this.getHoursAndMinutes(2, 45, 4, 0);
      })
      .catch(err => {
        console.log(err.message, err.code);
        console.log("Failed to read file");
      });
  };

  calculateHourAndMinute(persons: [Person]) {
    persons.splice(0, 1);
    persons.splice(persons.length - 1, 1);
    let index = 0;

    let personWithTimeArray: [PersonWithWorkTime] = persons.map(item => {
      console.log(item.name);
      console.log(item.id);
      console.log(item.date);
      console.log(item.start);
      console.log(item.end);

      let startTime = item.start.split(":");
      let startHour = parseInt(startTime[0]);
      let startMin = parseInt(startTime[1]);

      let endTime = item.end.split(":");
      let endHour = parseInt(endTime[0]);
      let endMin = parseInt(endTime[1]);

      let hour = 0;
      let min = 0;

      this.getHoursAndMinutes(startHour, startMin, endHour, endMin);

      return (PersonWithWorkTime = {
        name: item.name,
        id: item.id,
        date: item.date,
        start: item.start,
        end: item.end,
        hour: hour,
        minute: min
      });
    });
  }

  getHoursAndMinutes = (startHour, startMin, endHour, endMin) => {
    let min = 0;
    let hour = 0;

    if (endMin > startMin) {
      min = endMin - startMin;
    } else if (endMin == startMin) {
      min = 0;
    } else {
      min = 60 - startMin + endMin;
    }

    if (endHour > startHour) {
      hour = endHour - startHour;
    } else if (endHour == startHour) {
      hour = 0;
    } else {
      hour = endHour + 24 - startHour;
    }

    //Adjust hour based on min
    if (min >= 60) {
      hour = hour + 1;
      min = min - 60;
    }

    if (startMin > endMin) {
      hour = hour - 1;
    }

    console.log("calculated hour is " + hour);
    console.log("calculated min is " + min);

    this.getEveningHoursAndMinutes(
      startHour,
      startMin,
      endHour,
      endMin,
      hour,
      min
    );
  };

  getEveningHoursAndMinutes = (
    startHour,
    startMin,
    endHour,
    endMin,
    hour,
    min
  ) => {
    let eveningHours = 0;
    let eveningMinutes = 0;

    //Shift is on the same day
    if (endHour > startHour) {
      //Calculate Hours
      if (startHour <= 6) {
        eveningHours += Math.min(6, 6 - startHour);
        if (startHour < 6) {
          eveningMinutes += 60 - startMin;
        }
      } else if (startHour >= 19) {
        eveningMinutes += 60 - startMin;
      }
      // console.log("evening minutes 1 " + eveningMinutes);
      if (endHour <= 6) {
        eveningHours = Math.min(6, endHour - startHour);
        if (endHour < 6) {
          eveningMinutes += endMin;
        }
      } else if (endHour >= 19) {
        eveningHours += Math.min(hour, endHour - 19);
        eveningMinutes += endMin;
      }
      // console.log("evening minutes 2 " + eveningMinutes);
      //Calculate Minutes
    } else if (endHour < startHour) {
      //Shift is between two days
      //Calculate Hours
      if (startHour >= 19) {
        eveningHours += 24 - startHour;
        eveningMinutes += 60 - startMin;
      } else {
        eveningHours += 24 - 19;
      }

      if (endHour >= 19) {
        eveningHours += 6 + 24 - endHour;
        eveningMinutes += endMin;
      } else {
        eveningHours += Math.min(6, endHour);
        if (endHour < 6) {
          eveningMinutes += endMin;
        }
      }
      //Calculate Minutes
    } else {
      if (startHour <= 6 || endHour >= 19) {
        if (startHour != 6) {
          eveningMinutes = min;
        }
      }
    }

    if (startMin > endMin) {
      if (eveningHours > 0) {
        eveningHours = eveningHours - 1;
      }
    }

    console.log('final evening minutes ' + eveningMinutes);

    //Adjust hour based on min
    if (eveningMinutes >= 60) {
      eveningMinutes = eveningMinutes - 60;
    }

    console.log("evening hours is " + eveningHours);
    console.log("evening minutes is " + eveningMinutes);
  };

  goToForgotPassword = () => {
    Navigation.push(this.props.componentId, {
      component: {
        name: "ForgotPasswordScreen"
      }
    });
  };
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
    color: "#2e45ec"
  },
  center: {
    alignSelf: "center",
    marginTop: 10
  }
});
