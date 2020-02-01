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
import type { Person, PersonWithWorkTime, PersonWithWage } from "../../types";
import * as Constants from "../../constants";

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
    var splitDetails = contents.split("\n");
    console.log("splitDetails count is " + splitDetails.length);

    let persons: [Person] = splitDetails.map(item => {
      let newPerson = item.split(",");
      return (Person = {
        name: newPerson[0],
        id: newPerson[1],
        date: newPerson[2],
        start: newPerson[3],
        end: newPerson[4]
      });
    });

    console.log("finalArray count is " + persons.length);
    this.calculateHourAndMinute(persons);
  }

  calculateHourAndMinute(persons: [Person]) {
    //Remove the header from the CSV file format
    persons.splice(0, 1);
    //Remove the laste blank entry
    persons.splice(persons.length - 1, 1);

    console.log("Persons count is is " + persons.length);

    let personWithTimeArray: [PersonWithWorkTime] = persons.map(item => {
      let startTime = item.start.split(":");
      let startHour = parseInt(startTime[0]);
      let startMin = parseInt(startTime[1]);

      let endTime = item.end.split(":");
      let endHour = parseInt(endTime[0]);
      let endMin = parseInt(endTime[1]);

      console.log("startTime " + startHour + ":" + startMin);
      console.log("startHour " + endHour + ":" + endMin);

      startHour += startMin / 60;
      endHour += endMin / 60;

      console.log("startHour " + startHour);
      console.log("endHour " + endHour);

      return this.getWorkHoursAndEveningHours(item, startHour, endHour);
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

    //Calculate wage for each distinct person
    this.calculateWageForEachPerson(personWithTimeArray, uniquePersons);
  }

  calculateWageForEachPerson = (personWithTimeArray, uniquePersons) => {
    //Now separate each person from the list using their id
    let wageArray = uniquePersons.map(id => {
      let personDetails = personWithTimeArray.filter(item => item.id == id);
      console.log("personDetails count is " + personDetails.length);

      // personDetails.map(item => {
      //   console.log(item);
      // });
      let combinedShift: [PersonWithWage] = this.combineMultipleShifts(
        personDetails
      );
      console.log(combinedShift.length);

      combinedShift.map(item => {
        console.log(item);
      });

      const total = combinedShift.reduce(
        (prevValue, currentValue) => prevValue + currentValue.wage,
        0
      );

      console.log("total is " + total);

      var output: PersonWithWage = combinedShift.reduce(function(acc, item) {
        return item;
      }, {});

      return (PersonWithWage = {
        name: output.name,
        id: output.id,
        wage: parseFloat(total.toFixed(2))
      });
    });

    console.log(wageArray.length);

    wageArray.map(item => {
      console.log(item);
    });
  };

  combineMultipleShifts = personDetails => {
    //Combine mutliple shifts into one.
    const uniqueEntry = [];
    personDetails.map(item => {
      let el = uniqueEntry.filter(e => e.date === item.date);
      if (el.length > 0) {
        let index = uniqueEntry.indexOf(el[0]);
        if (index != -1) {
          uniqueEntry[index].workingHour += item.workingHour;
          uniqueEntry[index].eveningHour += item.eveningHour;
          uniqueEntry[index].eveningMinute += item.eveningMinute;
        }
      } else {
        uniqueEntry.push(item);
      }
    });

    console.log("uniqueEntry count is " + uniqueEntry.length);

    uniqueEntry.map(item => {
      console.log(item);
    });

    return this.calculateWages(uniqueEntry);
  };

  //Calculate wage for every day
  calculateWages = uniqueEntry => {
    return uniqueEntry.map(item => {
      var totalHours = item.workingHour;
      var eveningHours = item.eveningHour;

      // console.log("name " + item.name);
      // console.log("date " + item.date);
      // console.log("totalHours " + item.workingHour);
      // console.log("eveningHours " + item.eveningHour);
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

      let overtimeHours = 0;

      var didWorkOvertime = false;
      if (totalHours >= Constants.OVERTIME_THRESHOLD) {
        didWorkOvertime = true;
      }

      var didWorkEvening = false;
      if (eveningHours > 0) {
        didWorkEvening = true;
      }

      let normalHours = 0;

      let overtimeWage = 0;
      let eveningWage = 0;
      let wage = 0;

      if (didWorkOvertime) {
        //Calculate overtime wage
        normalHours = Constants.OVERTIME_THRESHOLD;
        overtimeHours = totalHours - normalHours;

        //Find the overtime hours eligible for additional quarter hourly rate
        let quarterOvertimeHours = Math.min(
          Constants.QUARTER_OVERTIME_THRESHOLD,
          overtimeHours
        );

        let halfOvertimeHours = Math.min(
          Constants.HALF_OVERTIME_THRESHOLD -
            Constants.QUARTER_OVERTIME_THRESHOLD,
          Math.max(0, overtimeHours - Constants.QUARTER_OVERTIME_THRESHOLD)
        );

        let fullOvertimeHours = Math.max(
          0,
          overtimeHours - Constants.HALF_OVERTIME_THRESHOLD
        );

        // console.log("quarterOvertime is " + quarterOvertimeHours);
        // console.log("halfOvertime is " + halfOvertimeHours);
        // console.log("fullOvertimeHours is " + fullOvertimeHours);
        // console.log("normalHours is " + normalHours);

        overtimeWage =
          quarterOvertimeHours * Constants.QUARTER_OVERTIME_RATE +
          halfOvertimeHours * Constants.HALF_OVERTIME_RATE +
          fullOvertimeHours * Constants.FULL_OVERTIME_RATE;
      } else if (didWorkEvening) {
        //Calculate evening wage
        normalHours = totalHours - eveningHours;
        // console.log("normalHours is " + normalHours);
        eveningWage = eveningHours * Constants.EVENING_COMPENSATION_RATE;
      } else {
        //Calculate normal wage
        normalHours = totalHours;
        // console.log("normalHours is " + normalHours);
      }
      wage = normalHours * Constants.HOURLY_RATE + overtimeWage + eveningWage;
      wage = parseFloat(wage.toFixed(2));
      // console.log("wage is " + wage);
      // console.log(" ");

      return (PersonWithWage = {
        name: item.name,
        id: item.id,
        wage: wage
      });
    });
  };

  getWorkHoursAndEveningHours = (item, startHour, endHour) => {
    let workHours = 0;

    workHours = Math.abs(endHour - startHour);

    console.log("workHours " + workHours);
    console.log(" ");
    // console.log("calculated hour is " + hour);
    // console.log("calculated min is " + min);

    let eveningHours = this.getEveningHours(item, startHour, endHour, workHours);
    
    return (PersonWithWorkTime = {
      name: item.name,
      id: item.id,
      date: item.date,
      workingHour: workHours,
      eveningHour: eveningHours
    });
  };

  getEveningHours = (item, startHour, endHour, workHours) => {
    let eveningHours = 0;
    //Shift is on the same day
    if (endHour > startHour) {
      //Calculate evening hours for the shifts on the same day
      eveningHours = this.calculateEveningHoursSameDayShifts(
        startHour,
        endHour
      );
    } else if (endHour < startHour) {
      //Shifts are overlapping to the next day
      //Calculate evening hours for the overlapping shifts
      eveningHours = this.calculateEveningHoursForOverlappingShift(
        startHour,
        endHour
      );
    }
    console.log("evening hours is " + eveningHours);
    return eveningHours;
  };

  calculateEveningHoursSameDayShifts = (startHour, endHour) => {
    let eveningHours = 0;
    //Add the early morning hours
    if (startHour < Constants.EVENING_WORK_END_TIME) {
      eveningHours += Math.min(
        Constants.EVENING_WORK_END_TIME,
        Constants.EVENING_WORK_END_TIME - startHour
      );
    }

    //Add the evening hours
    if (endHour >= Constants.EVENING_WORK_BEGIN_TIME) {
      eveningHours += endHour - Constants.EVENING_WORK_BEGIN_TIME;
    }

    //If start and end is in the evening
    //set the evening hours
    if (startHour >= Constants.EVENING_WORK_BEGIN_TIME) {
      eveningHours = endHour - startHour;
    }

    //If start and end is in the early morning
    //set the early morning hours
    if (endHour <= Constants.EVENING_WORK_END_TIME) {
      eveningHours = endHour - startHour;
    }
    return eveningHours;
  };

  calculateEveningHoursForOverlappingShift = (startHour, endHour) => {
    let eveningHours = 0;
    //Add the early hours on the first day
    if (startHour < Constants.EVENING_WORK_END_TIME) {
      eveningHours += Constants.EVENING_WORK_END_TIME - startHour;
    }

    //Add the evening hours on the first day
    eveningHours += 24 - Math.max(Constants.EVENING_WORK_BEGIN_TIME, startHour);

    //Add the overnight hours from the next day
    eveningHours += Math.min(Constants.EVENING_WORK_END_TIME, endHour);

    //Add the evening hours on the next day
    if (endHour >= Constants.EVENING_WORK_BEGIN_TIME) {
      eveningHours += endHour - Constants.EVENING_WORK_BEGIN_TIME;
    }
    return eveningHours;
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
