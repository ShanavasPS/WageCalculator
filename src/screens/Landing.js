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
  TouchableOpacity,
  StyleSheet,
  Alert
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";

import type { Shift, ShiftWithWorkHours, PersonWithWage } from "../../types";
import * as Constants from "../../constants";
import FileViewer from "react-native-file-viewer";
import DocumentPicker from "react-native-document-picker";
import { Button } from 'react-native-elements';

var RNFS = require("react-native-fs");

export default class Landing extends Component {
  static get options() {
    return {
      topBar: {
        visible: true,
        title: {
          text: "Wage Calculator",
          color: '#2089DC',
          fontSize: 18
        },
        background: {
          color: '#FBFCFC'
        }
      }
    };
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <View style={styles.main}>
            <Button
              title="Open CSV File"
              buttonStyle={{ width: "100%" }}
              onPress={this.openCSVFile}
              type="outline"
            />
          </View>
        </View>
      </View>
    );
  }

  //
  openCSVFile = async () => {
    // Pick a single file
    try {
      const res = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles]
      });
      this.readFile(res.uri);
    } catch (err) {
      if (DocumentPicker.isCancel(err)) {
        // User cancelled the picker, exit any dialogs or menus and move on
      } else {
        throw err;
      }
    }
  };

  //
  readFile = async filePath => {
    RNFS.readFile(filePath, "utf8")
      .then(contents => {
        // log the file contents
        let shifts = this.extractShiftsFromCSVFile(contents);

        shifts = this.removeHeaderAndFooter(shifts);

        //Calculate total hours and evening hours
        let shiftsWithWorkHours = this.calculateTotalAndEveningHours(shifts);

        //Combine multiple shifts of the same person on the same day into one
        shiftsWithWorkHours = this.combineMultipleShifts(shiftsWithWorkHours);

        let shiftsWithOverTime = this.calculateOvertimeHours(
          shiftsWithWorkHours
        );

        let shiftsWithWages = this.calculateWageForEachShift(
          shiftsWithOverTime
        );

        //Now find the number of unique persons in the shift
        let uniquePersons = this.findUniquePersonsInTheShifts(shiftsWithWages);

        let sortedPersons = this.sortPersons(uniquePersons);

        //Calculate wage for each distinct person
        let monthlyWages = this.calculateMonthlyWageForAllThePersons(
          shiftsWithWages,
          sortedPersons
        );

        let fileHeader = this.getFileHeader(shiftsWithWages);

        this.goToHome(shiftsWithWages, monthlyWages, fileHeader);
      })
      .catch(err => {
        Alert.alert(
          "Failed to read file",
          "Please upload a valid csv file",
          [{ text: "OK" }],
          { cancelable: false }
        );
      });
  };

  goToHome = (shiftsWithWages, monthlyWages, fileHeader) =>
    Navigation.push(this.props.componentId, {
      component: {
        name: "HomeScreen",
        passProps: {
          shiftsWithWages,
          monthlyWages,
          fileHeader
        }
      }
    });

  extractShiftsFromCSVFile(contents) {
    var splitShifts = contents.split("\n");
    let shifts: [Person] = splitShifts.map(item => {
      let shift = item.split(",");
      return (Person = {
        name: shift[0],
        id: shift[1],
        date: shift[2],
        start: shift[3],
        end: shift[4]
      });
    });
    return shifts;
  }

  removeHeaderAndFooter = shifts => {
    //Remove the header from the CSV file format
    shifts.splice(0, 1);
    //Remove the last blank entry
    shifts.splice(shifts.length - 1, 1);
    return shifts;
  };

  calculateTotalAndEveningHours = shifts => {
    return shifts.map(shift => {
      return this.calculateTotalAndEveningHoursForShift(shift);
    });
  };

  calculateOvertimeHours = shifts => {
    return shifts.map(shift => {
      return (ShiftWithWorkHours = {
        ...shift,
        overtimeHours: this.getOvertimeHours(shift.totalHours)
      });
    });
  };

  getOvertimeHours = hours => {
    return Math.max(0, hours - Constants.OVERTIME_THRESHOLD);
  };

  getHoursFromTime = time => {
    let hourMin = time.split(":");
    let hour = parseInt(hourMin[0]);
    let min = parseInt(hourMin[1]);
    return hour + min / 60;
  };

  findUniquePersonsInTheShifts = shiftsWithWorkHours => {
    let uniquePersons = [];
    shiftsWithWorkHours.map(item => {
      if (uniquePersons.indexOf(item.id) === -1) {
        uniquePersons.push(item.id);
      }
    });
    return uniquePersons;
  };

  sortPersons = persons => {
    persons.sort((a, b) => a - b);
    return persons;
  };

  getFileHeader = shiftsWithWorkHours => {
    let singleShift = this.getPersonDetails(shiftsWithWorkHours);
    let date = singleShift.date.split(".");
    let month = date[1];
    if (month.length < 2) {
      month = "0" + month;
    }
    let year = date[2];
    return "Monthly Wages " + month + "/" + year;
  };

  calculateMonthlyWageForAllThePersons = (
    shiftsWithWorkHours,
    uniquePersons
  ) => {
    //Now separate each person from the list using their id
    return uniquePersons.map(id => {
      return this.calculateMonthlyWage(shiftsWithWorkHours, id);
    });
  };

  calculateMonthlyWage = (shiftsWithWorkHours, id) => {
    //Extarct the shifts of the current person
    let shifts = this.getTheShiftsOfThePersonWithId(shiftsWithWorkHours, id);

    let totalWage = this.calculateTotalWageForAllTheShifts(shifts);

    let person = this.getPersonDetails(shifts);

    return (PersonWithWage = {
      id: person.id,
      name: person.name,
      date: person.date,
      wage: parseFloat(totalWage.toFixed(2))
    });
  };

  getTheShiftsOfThePersonWithId = (shifts, id) => {
    return shifts.filter(item => item.id == id);
  };

  getPersonDetails = shifts => {
    return shifts.reduce(function (acc, item) {
      return item;
    }, {});
  };

  calculateTotalWageForAllTheShifts = shifts => {
    return shifts.reduce(
      (prevValue, currentValue) => prevValue + currentValue.wage,
      0
    );
  };

  combineMultipleShifts = shifts => {
    //Combine mutliple shifts into one.
    let uniqueShifts = [];
    shifts.map(item => {
      //filter the current array to find if it already has the shift
      let shift = uniqueShifts.filter(
        shift => shift.date === item.date && shift.id == item.id
      );
      //Check if filtered array contains an element.
      if (shift.length > 0) {
        //If yes, add the total hours and evening hours
        let index = uniqueShifts.indexOf(shift[0]);
        if (index != -1) {
          uniqueShifts[index].totalHours += item.totalHours;
          uniqueShifts[index].eveningHours += item.eveningHours;
        }
      } else {
        //If not, add the new shift to the array
        uniqueShifts.push(item);
      }
    });
    return uniqueShifts;
  };

  //Calculate wage for every day
  calculateWageForEachShift = uniqueShifts => {
    return uniqueShifts.map(shift => {
      return (ShiftWithWorkHours = {
        ...shift,
        wage: this.calculateWage(shift.totalHours, shift.eveningHours)
      });
    });
  };

  calculateWage = (totalHours, eveningHours) => {
    let overtimeHours = Math.max(0, totalHours - Constants.OVERTIME_THRESHOLD);

    eveningHours = overtimeHours > 0 ? 0 : eveningHours;

    let regularHours = totalHours - overtimeHours - eveningHours;

    //Regular daily wage = Regular working hours * Hourly rate
    let regularWage = regularHours * Constants.HOURLY_RATE;

    //Evening wage = Evening working hours * Evening compensation rate
    let eveningWage = eveningHours * Constants.EVENING_COMPENSATION_RATE;

    //calculate the Overtime wage
    let overtimeWage = this.getOvertimeWage(overtimeHours);

    //Total daily pay = Regular daily wage + Evening work compensation
    // + Overtime compensation
    let totalWage = regularWage + overtimeWage + eveningWage;

    //Get the wage with precision to the nearest cent
    return parseFloat(totalWage.toFixed(2));
  };

  //calculates the overtime wage for the given overtime hours
  getOvertimeWage = overtimeHours => {
    let overtimeWage = 0;

    //Find the overtime hours eligible for additional quarter hourly rate
    let quarterOvertimeHours = this.getOvertime(
      0,
      Constants.QUARTER_OVERTIME_THRESHOLD,
      overtimeHours
    );

    //Find the overtime hours eligible for additional half hourly rate
    let halfOvertimeHours = this.getOvertime(
      Constants.QUARTER_OVERTIME_THRESHOLD,
      Constants.HALF_OVERTIME_THRESHOLD,
      overtimeHours
    );

    //Find the overtime hours eligible for additional full hourly rate
    let fullOvertimeHours = this.getOvertime(
      Constants.HALF_OVERTIME_THRESHOLD,
      overtimeHours,
      overtimeHours
    );

    overtimeWage =
      quarterOvertimeHours * Constants.QUARTER_OVERTIME_RATE +
      halfOvertimeHours * Constants.HALF_OVERTIME_RATE +
      fullOvertimeHours * Constants.FULL_OVERTIME_RATE;
    return overtimeWage;
  };

  //This method calculates the hours between the control and hours
  //by using a limit threshold
  getOvertime = (control, limit, hours) => {
    return Math.min(Math.max(0, limit - control), Math.max(0, hours - control));
  };

  //Calculate the total hours and evening hours for a given shift
  calculateTotalAndEveningHoursForShift = shift => {
    let startHour = this.getHoursFromTime(shift.start);
    let endHour = this.getHoursFromTime(shift.end);
    let totalHours = Math.abs(endHour - startHour);
    let eveningHours = this.calculateEveningHours(
      totalHours,
      startHour,
      endHour
    );

    return (ShiftWithWorkHours = {
      ...shift,
      totalHours: totalHours,
      eveningHours: eveningHours
    });
  };

  //Calculates the evening hours worked for the given time periods
  calculateEveningHours = (totalHours, startHour, endHour) => {
    let eveningHours =
      this.getEveningHours(startHour) + this.getEveningHours(endHour);
    //Making sure evening hours are not greater than total hours
    //in case the shift started and ended within the evening time
    eveningHours = Math.min(totalHours, eveningHours);
    return eveningHours;
  };

  //Calculates the hours worked for the given hours
  getEveningHours = hour => {
    return (
      Math.max(0, Constants.EVENING_WORK_END_TIME - hour) +
      Math.max(0, hour - Constants.EVENING_WORK_BEGIN_TIME)
    );
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
  },
  fieldContainer: {
    marginTop: 20
  },
  label: {
    fontSize: 16
  },
  textInput: {
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
    alignSelf: "center"
  }
});