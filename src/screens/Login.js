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
import type { Person, PersonWithWorkTime, PersonWithWage } from "../../types";
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


            <Button title="Open CSV File" color="#0064e1" onPress={this.openCSVFile} />

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
  readFile = async (filePath) => {
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
        this.extractDataFromCSVFile(contents);
        // this.getEveningHoursAndMinutes(19, 15, 22, 30, 3, 15);
      })
      .catch(err => {
        console.log(err.message, err.code);
        console.log("Failed to read file");
      });
  };

  extractDataFromCSVFile(contents) {
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

    //Calculate total hours and evening hours
    let shiftsWithWorkHours: [PersonWithWorkTime] = this.calculateHourAndMinute(
      shifts
    );
    console.log("personsWithWorkHours is " + shiftsWithWorkHours.length);
    shiftsWithWorkHours.map(item => {
      console.log(item);
    });

    //Now find the number of unique persons in the shift
    let uniquePersons = this.findUniquePersonsInTheShifts(shiftsWithWorkHours);
    console.log("Number of distinct persons is " + uniquePersons.length);

    //Calculate wage for each distinct person
    let wageArray = this.calculateWageForAllThePersons(shiftsWithWorkHours, uniquePersons);
    
    let fileHeader = this.getFileHeader(shiftsWithWorkHours);

    goToHome(wageArray, fileHeader);
  }

  getFileHeader = shiftsWithWorkHours => {
    let singleShift = shiftsWithWorkHours.reduce(function(acc, item) {
      return item;
    }, {});
    let date = singleShift.date.split(".");
    let month = date[1];
    if (month.length < 2) {
      month = "0" + month;
    }
    let year = date[2];
    return 'Monthly Wages ' + month + "/" + year;
  };

  findUniquePersonsInTheShifts = personsWithWorkHours => {
    let uniquePersons = [];
    personsWithWorkHours.map(item => {
      if (uniquePersons.indexOf(item.id) === -1) {
        uniquePersons.push(item.id);
      }
    });
    uniquePersons.sort((a,b) => a - b);
    return uniquePersons;
  };

  calculateHourAndMinute(persons: [Person]) {
    //Remove the header from the CSV file format
    persons.splice(0, 1);
    //Remove the laste blank entry
    persons.splice(persons.length - 1, 1);

    console.log("Persons count is is " + persons.length);

    return persons.map(item => {
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

      let result = this.getWorkHoursAndEveningHours(item, startHour, endHour);

      return (PersonWithWorkTime = {
        name: item.name,
        id: item.id,
        date: item.date,
        workingHour: result.workingHour,
        eveningHour: result.eveningHour
      });
    });
  }

  calculateWageForAllThePersons = (personsWithWorkHours, uniquePersons) => {
    //Now separate each person from the list using their id
    let wages: [PersonWithWage] = uniquePersons.map(id => {
      return this.calculateWage(personsWithWorkHours, id);
    });

    console.log(wages.length);

    wages.map(item => {
      console.log(item);
    });
    return wages;
  };

  calculateWage = (personsWithWorkHours, id) => {
    //Extarct the shifts of the current person
    let shifts = personsWithWorkHours.filter(item => item.id == id);
    console.log("personShifts count is " + shifts.length);
    // personDetails.map(item => {
    //   console.log(item);
    // });

    let combinedShifts = this.combineMultipleShifts(shifts);
    console.log("length after combining Shifts" + combinedShifts.length);
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
    let uniqueEntry = [];
    shifts.map(item => {
      let el = uniqueEntry.filter(e => e.date === item.date);
      if (el.length > 0) {
        let index = uniqueEntry.indexOf(el[0]);
        if (index != -1) {
          uniqueEntry[index].workingHour += item.workingHour;
          uniqueEntry[index].eveningHour += item.eveningHour;
        }
      } else {
        uniqueEntry.push(item);
      }
    });

    console.log("uniqueEntry count is " + uniqueEntry.length);
    return uniqueEntry;
  };

  //Calculate wage for every day
  calculateWageForEachShift = uniqueEntry => {
    return uniqueEntry.map(item => {
      var totalHours = item.workingHour;
      var eveningHours = item.eveningHour;

      let overtimeHours = 0;
      let normalHours = 0;

      let overtimeWage = 0;
      let eveningWage = 0;
      let wage = 0;

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

      if (totalHours >= Constants.OVERTIME_THRESHOLD) {
        //Calculate overtime wage
        normalHours = Constants.OVERTIME_THRESHOLD;
        overtimeHours = totalHours - normalHours;
        overtimeWage = this.getOvertimeWage(overtimeHours);
      } else if (eveningHours > 0) {
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
        id: item.id,
        name: item.name,
        date: item.date,
        wage: wage,
      });
    });
  };

  getOvertimeWage = overtimeHours => {
    let overtimeWage = 0;

    //Find the overtime hours eligible for additional quarter hourly rate
    let quarterOvertimeHours = Math.min(
      Constants.QUARTER_OVERTIME_THRESHOLD,
      overtimeHours
    );

    let halfOvertimeHours = Math.min(
      Constants.HALF_OVERTIME_THRESHOLD - Constants.QUARTER_OVERTIME_THRESHOLD,
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
    return overtimeWage;
  };

  getWorkHoursAndEveningHours = (item, startHour, endHour) => {
    let workHours = 0;

    workHours = Math.abs(endHour - startHour);

    // console.log("workHours " + workHours);
    // console.log(" ");
    // console.log("calculated hour is " + hour);
    // console.log("calculated min is " + min);

    let eveningHours = this.getEveningHours(
      item,
      startHour,
      endHour,
      workHours
    );

    return {
      workingHour: workHours,
      eveningHour: eveningHours
    };
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
