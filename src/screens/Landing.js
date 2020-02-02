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
import * as Calculator from "./Calculator";

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

        shifts = Calculator.removeHeaderAndFooter(shifts);
      
        //Calculate total hours and evening hours
        let shiftsWithWorkHours = Calculator.calculateTotalAndEveningHours(shifts);

        //Combine multiple shifts of the same person on the same day into one
        shiftsWithWorkHours = Calculator.combineMultipleShifts(shiftsWithWorkHours);

        let shiftsWithOverTime = Calculator.calculateOvertimeHours(
          shiftsWithWorkHours
        );

        let shiftsWithWages = Calculator.calculateWageForEachShift(
          shiftsWithOverTime
        );

        //Now find the number of unique persons in the shift
        let uniquePersons = Calculator.findUniquePersonsInTheShifts(shiftsWithWages);

        let sortedPersons = Calculator.sortPersons(uniquePersons);

        //Calculate wage for each distinct person
        let monthlyWages = Calculator.calculateMonthlyWageForAllThePersons(
          shiftsWithWages,
          sortedPersons
        );

        let fileHeader = Calculator.getFileHeader(shiftsWithWages);

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