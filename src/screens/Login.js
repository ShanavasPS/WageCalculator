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
        this.extractDataFromCSVFile(contents);
        // this.getEveningHoursAndMinutes(19, 15, 22, 30, 3, 15);
      })
      .catch(err => {
        console.log(err.message, err.code);
        console.log("Failed to read file");
      });
  };

  extractDataFromCSVFile(contents) {
    var myArray = contents.split("\n");
    console.log("contents count is " + myArray.length);

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

    console.log("finalArray count is " + finalArray.length);
    this.calculateHourAndMinute(finalArray);
  }

  calculateHourAndMinute(persons: [Person]) {
    persons.splice(0, 1);
    persons.splice(persons.length - 1, 1);
    let index = 0;

    console.log("Persons count is is " + persons.length);

    let personWithTimeArray: [PersonWithWorkTime] = persons.map(item => {
      let startTime = item.start.split(":");
      let startHour = parseInt(startTime[0]);
      let startMin = parseInt(startTime[1]);

      let endTime = item.end.split(":");
      let endHour = parseInt(endTime[0]);
      let endMin = parseInt(endTime[1]);

      return this.getHoursAndMinutes(
        item,
        startHour,
        startMin,
        endHour,
        endMin
      );
    });

    //Calculated total hours and evening hours
    console.log("personWithTimeArray is " + personWithTimeArray.length);
    personWithTimeArray.map(item => {
      console.log(item);
    });

    //Now find the number of unique persons in the shift
    const uniquePersons = [];
    personWithTimeArray.map(item => {
      if (uniquePersons.indexOf(item.id) === -1) {
        uniquePersons.push(item.id);
      }
    });

    console.log("Number of distinct persons is " + uniquePersons.length);

    //Now separate each person from the list using their id
    let firstPersonDetails = personWithTimeArray.filter(
      item => item.id == uniquePersons[0]
    );

    console.log("firstPersonDetails count is " + firstPersonDetails.length);

    firstPersonDetails.map(item => {
      console.log(item);
    });

    //Combine mutliple shifts into one.
    const uniqueEntry = [];
    firstPersonDetails.map(item => {
      let el = uniqueEntry.filter(e => e.date === item.date);
      if (el.length > 0) {
        let index = uniqueEntry.indexOf(el[0]);
        if (index != -1) {
          uniqueEntry[index].workingHour += item.workingHour
          uniqueEntry[index].workingMinute += item.workingMinute
          uniqueEntry[index].eveningHour += item.eveningHour
          uniqueEntry[index].eveningMinute += item.eveningMinute
        }
      } else {
        uniqueEntry.push(item);
      }
    });

    console.log("uniqueEntry count is " + uniqueEntry.length);

    uniqueEntry.map(item => {
      console.log(item);
    });

    this.calculateWages(uniqueEntry);
  }

  //Calculate wage for every day
  calculateWages = (uniqueEntry) => {
    uniqueEntry.map(item => {
      var totalHours = item.workingHour;
      var totalMinutes = item.workingMinute;
      var eveningHours = item.eveningHour;
      var eveningMinutes = item.eveningMinute;

      console.log('name ' + item.name)
      console.log('date ' + item.date)
      console.log('totalHours ' + item.workingHour)
      console.log('totalMinutes ' + item.workingMinute)
      console.log('eveningHours ' + item.eveningHour)
      console.log('eveningMinutes ' + item.eveningMinute)
      //Total daily pay = Regular daily wage + Evening work compensation
      // + Overtime compensation
      //Regular daily wage = Regular working hours * Hourly wage
      // Hourly wage rate = $4.25
      // Evening wage for work between 19:00 and 06:00
      // Evening wage rate = $5.50
      // Overtime wage for work exceeding 8 hours
      // If calculating overtime, evening hours are not considered.
      // First 3 to 8 = $4.25 + 25%
      // Next 1 hour = $4.25 + 50%
      // After that = $4.25 + 100% 

      //First check for overtime hours
      if (totalMinutes >= 60) {
        totalHours += 1;
        totalMinutes -= 60;
      }
      if (eveningMinutes >= 60) {
        eveningHours += 1;
        eveningMinutes -= 60;
      }

      let overtimeHours = 0;
      let overtimeMinutes = 0;  

      var didWorkOvertime = false;
      if(totalHours > 8) {
        didWorkOvertime = true;
        overtimeHours = totalHours - 8;
        overtimeMinutes = totalMinutes;
      }
      else if(totalHours == 8) {
        if (totalMinutes > 0) {
          didWorkOvertime = true;
          overtimeMinutes = totalMinutes;
        }
      }

      var didWorkEvening = false;
      if(eveningHours > 0 || eveningMinutes > 0) {
        didWorkEvening = true;
      }

      let normalMinutes = 0;
      let normalHours = 0;

      let hourlyRate = 4.25;
      let eveningRate = hourlyRate + 1.25;
      let quarterOverTimeRate = hourlyRate * 1.25
      let halfOverTimeRate = hourlyRate * 1.5
      let doubleOverTimeRate = hourlyRate * 2

      let normalWork = 0;
      let overtimeWage = 0;
      let eveningWage = 0;
      let wage = 0;

      if(didWorkOvertime) { //Calculate overtime wage
        let overTimeRate = 0;
        normalMinutes = 0;
        normalHours = 8;

        let quarterOvertimeHours = Math.min(3, overtimeHours);
        let quarterOvertimeMinutes = 0;
        if(quarterOvertimeHours < 3) {
          quarterOvertimeMinutes = overtimeMinutes;
        }

        let halfOvertimeHours = Math.min(1, Math.max(0, overtimeHours - 3));
        let halfOvertimeMinutes = 0;
        if (quarterOvertimeHours == 3 && overtimeMinutes > 0) {
          halfOvertimeMinutes = overtimeMinutes;
        }

        let doubleOvertimeHours = Math.max(0, overtimeHours - 4);
        let doubleOvertimeMinutes = 0;
        if (halfOvertimeHours == 1 && overtimeMinutes > 0) {
          doubleOvertimeMinutes = overtimeMinutes;
        }

        let quarterOvertime = quarterOvertimeHours + quarterOvertimeMinutes/60;
        let halfOvertime = halfOvertimeHours + halfOvertimeMinutes/60;
        let doubleOvertime = doubleOvertimeHours + doubleOvertimeMinutes/60

        console.log('quarterOvertime is ' + quarterOvertime);       
        console.log('halfOvertime is ' + halfOvertime);
        console.log('doubleOvertime is ' + doubleOvertime);

        normalWork = normalHours + normalMinutes/60;
        console.log('normalWork is ' + normalWork)

        overtimeWage = quarterOvertime * quarterOverTimeRate 
                            + halfOvertime * halfOverTimeRate
                            + doubleOvertime * doubleOverTimeRate;
      }
      else if(didWorkEvening) { //Calculate evening wage
        normalMinutes = totalMinutes - eveningMinutes;
        normalHours = totalHours - eveningHours;
        let eveningWork = eveningHours + eveningMinutes/60;
        console.log('eveningWork is ' + eveningWork)
        normalWork = normalHours + normalMinutes/60;
        console.log('normalWork is ' + normalWork)
        eveningWage = eveningWork * eveningRate;
      }
      else {  //Calculate normal wage
        normalMinutes = totalMinutes;
        normalHours = totalHours;
        normalWork = normalHours + normalMinutes/60;
        console.log('normalWork is ' + normalWork)
      }
      wage = normalWork * hourlyRate + overtimeWage + eveningWage;
      wage = parseFloat(wage.toFixed(2));
      console.log('wage is ' + wage)
      console.log(' ')
    });
  }

  getHoursAndMinutes = (item, startHour, startMin, endHour, endMin) => {
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

    return this.getEveningHoursAndMinutes(
      item,
      startHour,
      startMin,
      endHour,
      endMin,
      hour,
      min
    );
  };

  getEveningHoursAndMinutes = (
    item,
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

    console.log("final evening minutes " + eveningMinutes);

    //Adjust hour based on min
    if (eveningMinutes >= 60) {
      eveningMinutes = eveningMinutes - 60;
    }

    console.log("evening hours is " + eveningHours);
    console.log("evening minutes is " + eveningMinutes);

    return (PersonWithWorkTime = {
      name: item.name,
      id: item.id,
      date: item.date,
      workingHour: hour,
      workingMinute: min,
      eveningHour: eveningHours,
      eveningMinute: eveningMinutes
    });
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
