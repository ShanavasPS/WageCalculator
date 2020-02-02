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

import { goToHome } from "../../navigation";
import type { Shift, ShiftWithWorkHours, PersonWithWage } from "../../types";
import * as Constants from "../../constants";
import FileViewer from "react-native-file-viewer";
import DocumentPicker from "react-native-document-picker";

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

  render() {
    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <View style={styles.main}>
            <Button
              title="Open CSV File"
              color="#0064e1"
              onPress={this.openCSVFile}
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
      console.log(
        res.uri,
        res.type, // mime type
        res.name,
        res.size
      );

      // console.path('directory path is ' + RNFS.DocumentDirectoryPath);

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
    // console.log('directory path is ' + RNFS.DocumentDirectoryPath);

    // get a list of files and directories in the main bundle
    RNFS.readDir(RNFS.MainBundlePath) // On Android, use "RNFS.DocumentDirectoryPath" (MainBundlePath is not defined)
      .then(result => {
        // console.log('GOT RESULT', result.length);
      })
      .catch(err => {
        // console.log(err.message, err.code);
        console.log("Failed to read directory");
      });

    RNFS.readFile(filePath, "utf8")
      .then(contents => {
        // log the file contents
        let shifts = this.extractShiftsFromCSVFile(contents);

        shifts = this.removeHeaderAndFooter(shifts);

        shifts.map(id => {
          return console.log(id);;
        });

        //Calculate total hours and evening hours
        let shiftsWithWorkHours = this.calculateTotalAndEveningHours(shifts);

        //Now find the number of unique persons in the shift
        let uniquePersons = this.findUniquePersonsInTheShifts(
          shiftsWithWorkHours
        );

        let sortedPersons = this.sortPersons(uniquePersons);

        //Calculate wage for each distinct person
        let monthlyWages = this.calculateMonthlyWageForAllThePersons(
          shiftsWithWorkHours,
          sortedPersons
        );

        let fileHeader = this.getFileHeader(shiftsWithWorkHours);

        goToHome(monthlyWages, fileHeader);
      })
      .catch(err => {
        console.log(err.message, err.code);
      });
  };

  extractShiftsFromCSVFile(contents) {
    var splitShifts = contents.split("\n");
    console.log("splitShifts count is " + splitShifts.length);

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

    console.log("finalArray count is " + shifts.length);
    return shifts;
  }

  removeHeaderAndFooter = shifts => {
    //Remove the header from the CSV file format
    shifts.splice(0, 1);
    //Remove the laste blank entry
    shifts.splice(shifts.length - 1, 1);
    console.log("shifts count is is " + shifts.length);
    return shifts;
  };

  calculateTotalAndEveningHours = shifts => {
    return shifts.map(shift => {
      return this.calculateTotalAndEveningHoursForShift(shift);
    });
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
    let wages: [PersonWithWage] = uniquePersons.map(id => {
      return this.calculateMonthlyWage(shiftsWithWorkHours, id);
    });

    console.log(wages.length);

    wages.map(item => {
      console.log(item);
    });
    return wages;
  };

  calculateMonthlyWage = (shiftsWithWorkHours, id) => {
    //Extarct the shifts of the current person
    let shifts = shiftsWithWorkHours.filter(item => item.id == id);

    let combinedShifts = this.combineMultipleShifts(shifts);

    console.log("Combined shifts");
    combinedShifts.map(item => {
      console.log(item);
    });

    let combinedShiftWithWages = this.calculateWageForEachShift(combinedShifts);

    let totalWage = this.getTheTotalWageForAllTheShifts(combinedShiftWithWages);
    console.log("total is " + totalWage);

    let person = this.getPersonDetails(combinedShifts);

    return (PersonWithWage = {
      id: person.id,
      name: person.name,
      date: person.date,
      wage: parseFloat(totalWage.toFixed(2))
    });
  };

  getPersonDetails = combinedShifts => {
    return combinedShifts.reduce(function(acc, item) {
      return item;
    }, {});
  };

  getTheTotalWageForAllTheShifts = combinedShifts => {
    return combinedShifts.reduce(
      (prevValue, currentValue) => prevValue + currentValue.wage,
      0
    );
  };

  combineMultipleShifts = shifts => {
    //Combine mutliple shifts into one.
    let uniqueShifts = [];
    shifts.map(item => {
      let shift = uniqueShifts.filter(shift => shift.date === item.date);
      if (shift.length > 0) {
        let index = uniqueShifts.indexOf(shift[0]);
        if (index != -1) {
          uniqueShifts[index].totalHours += item.totalHours;
          uniqueShifts[index].eveningHours += item.eveningHours;
        }
      } else {
        uniqueShifts.push(item);
      }
    });
    console.log("uniqueShifts count is " + uniqueShifts.length);
    return uniqueShifts;
  };

  //Calculate wage for every day
  calculateWageForEachShift = uniqueShifts => {
    return uniqueShifts.map(shift => {
      return this.calculateWage(shift);
    });
  };

  calculateWage = shift => {
    console.log("calculateWage ");
    console.log(shift);
    var totalHours = shift.totalHours;
    var eveningHours = shift.eveningHours;

    let overtimeHours = 0;
    let regularHours = 0;

    let overtimeWage = 0;
    let eveningWage = 0;

    // console.log("name " + shift.name);
    // console.log("date " + shift.date);
    console.log("totalHours " + shift.totalHours);
    console.log("eveningHours " + shift.eveningHours);

    if (totalHours >= Constants.OVERTIME_THRESHOLD) {
      //Calculate overtime wage
      regularHours = Constants.OVERTIME_THRESHOLD;
      overtimeHours = totalHours - regularHours;
      overtimeWage = this.getOvertimeWage(overtimeHours);
    } else if (eveningHours > 0) {
      regularHours = totalHours - eveningHours;
      //Calculate evening wage
      eveningWage = eveningHours * Constants.EVENING_COMPENSATION_RATE;
    } else {
      regularHours = totalHours;
    }

    // console.log("regularHours is " + regularHours);

    //Regular daily wage = Regular working hours * Hourly wage
    let regularWage = regularHours * Constants.HOURLY_RATE;

    //Total daily pay = Regular daily wage + Evening work compensation
    // + Overtime compensation
    let totalWage = regularWage + overtimeWage + eveningWage;

    //Get the wage with precision to the nearest cent
    totalWage = parseFloat(totalWage.toFixed(2));
    console.log("totalWage is " + totalWage);

    return (PersonWithWage = {
      id: shift.id,
      name: shift.name,
      date: shift.date,
      wage: totalWage
    });
  };

  getOvertimeWage = overtimeHours => {
    let overtimeWage = 0;

    //Find the overtime hours eligible for additional quarter hourly rate
    let quarterOvertimeHours = this.getOvertimeHours(
      0,
      Constants.QUARTER_OVERTIME_THRESHOLD,
      overtimeHours
    );

    //Find the overtime hours eligible for additional half hourly rate
    let halfOvertimeHours = this.getOvertimeHours(
      Constants.QUARTER_OVERTIME_THRESHOLD,
      Constants.HALF_OVERTIME_THRESHOLD,
      overtimeHours
    );

    //Find the overtime hours eligible for additional full hourly rate
    let fullOvertimeHours = this.getOvertimeHours(
      Constants.HALF_OVERTIME_THRESHOLD,
      overtimeHours,
      overtimeHours
    );

    // console.log("quarterOvertime is " + quarterOvertimeHours);
    // console.log("halfOvertime is " + halfOvertimeHours);
    // console.log("fullOvertimeHours is " + fullOvertimeHours);
    // console.log("normalHours is " + normalHours);

    overtimeWage =
      quarterOvertimeHours * Constants.QUARTER_OVERTIME_RATE +
      halfOvertimeHours * Constants.HALF_OVERTIME_RATE +
      fullOvertimeHours * Constants.FULL_OVERTIME_RATE;
    return overtimeWage;
  };

  //This method calculates the hours between the control and hours
  //by using a limit threshold
  getOvertimeHours = (control, limit, hours) => {
    return Math.min(Math.max(0, limit - control), Math.max(0, hours - control));
  };

  calculateTotalAndEveningHoursForShift = item => {
    let startHour = this.getHoursFromTime(item.start);
    let endHour = this.getHoursFromTime(item.end);
    console.log("startHour " + startHour);
    console.log("endHour " + endHour);

    let totalHours = Math.abs(endHour - startHour);
    let eveningHours = this.calculateEveningHours(totalHours, startHour, endHour);

    return (ShiftWithWorkHours = {
      name: item.name,
      id: item.id,
      date: item.date,
      totalHours: totalHours,
      eveningHours: eveningHours
    });
  };

  calculateEveningHours = (totalHours, startHour, endHour) => {
    let eveningHours = this.getEveningHours(startHour) + this.getEveningHours(endHour);
    //Making sure evening hours are not greater than total hours
    //In case the shift started and ended within the evening time 
    eveningHours = Math.min(totalHours, eveningHours);
    return eveningHours;
  };

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