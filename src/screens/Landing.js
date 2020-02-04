/**
 * Monthly Wage App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Navigation } from "react-native-navigation";
import { View, StyleSheet } from "react-native";
import DocumentPicker from "react-native-document-picker";
import { Button } from "react-native-elements";
import * as Calculator from "./Calculator";

var RNFS = require("react-native-fs");
import { showOKAlert } from "./Common";

export default class Landing extends Component {
  static get options() {
    return {
      topBar: {
        visible: true,
        title: {
          text: "Wage Calculator",
          color: "#2089DC",
          fontSize: 18
        },
        background: {
          color: "#FBFCFC"
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
              title="Upload CSV File"
              buttonStyle={{ width: "100%", marginBottom: 20 }}
              onPress={this.openCSVFile}
              type="outline"
            />
            <Button
              title="Load test CSV File"
              buttonStyle={{ width: "100%" }}
              onPress={this.loadTestFile}
              type="outline"
            />
          </View>
        </View>
      </View>
    );
  }

  //This method opens a document picker
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

  //This method loads a test CSV file bundled within the application
  //so that the application can be easily tested
  loadTestFile = () => {
    let filename = "HourList201403.csv";
    if (Platform.OS === "ios") {
      this.readFile(RNFS.MainBundlePath + "/" + filename);
    } else {
      this.readFileAndroid(filename);
    }
  };

  //This method is used to read the bundled CSV file in iOS
  //and for reading the selected file from the document picker
  readFile = async filePath => {
    RNFS.readFile(filePath, "utf8")
      .then(contents => {
        // log the file contents
        this.calculateMonthlyWages(contents);
      })
      .catch(err => {
        showOKAlert("Failed to read file", "Please upload a valid csv file");
      });
  };

  //This method is used to read the test CSV file from the android assets folder
  //as the normal read function does not work for android assets folder.
  readFileAndroid = async filePath => {
    RNFS.readFileAssets(filePath, "utf8")
      .then(contents => {
        // log the file contents
        this.calculateMonthlyWages(contents);
      })
      .catch(err => {
        showOKAlert("Failed to read file", "Please upload a valid csv file");
      });
  };

  //This method details the steps performed to calulate the monthly wage
  //from the given CSV file
  calculateMonthlyWages = contents => {
    //First, extract the shifts from the CSV file
    let shifts = Calculator.extractShiftsFromCSVFile(contents);
    //then removes the header inorder to remove invalid values
    shifts = Calculator.removeHeader(shifts);

    //Calculate total hours and evening hours
    shifts = Calculator.calculateTotalAndEveningHours(shifts);

    //Combine multiple shifts of the same person on the same day into one
    shifts = Calculator.combineMultipleShifts(shifts);

    //Calculate the overtime now as the same day shifts are combined
    shifts = Calculator.calculateOvertimeHours(shifts);

    //Calculate the wage for each shift now that we have total, evening and overtime hours
    shifts = Calculator.calculateWageForEachShift(shifts);

    //Now find the number of unique persons in the shift
    let uniquePersons = Calculator.findUniquePersonsInTheShifts(shifts);

    //Sort the array now, so that its faster than sorting the entire shifts array.
    uniquePersons = Calculator.sortPersons(uniquePersons);

    //Calculate wage for each distinct person
    let monthlyWages = Calculator.calculateMonthlyWageForAllThePersons(
      shifts,
      uniquePersons
    );

    //Get the title/header to be displayed on top of the monthly wage
    let fileHeader = Calculator.getFileHeader(shifts);

    //Navigate to the home screen
    this.goToHome(shifts, monthlyWages, fileHeader);
  };

  //Method to navigate to the home screen with the details of the monthly wage
  goToHome = (shifts, monthlyWages, fileHeader) =>
    Navigation.push(this.props.componentId, {
      component: {
        name: "HomeScreen",
        passProps: {
          shifts,
          monthlyWages,
          fileHeader
        }
      }
    });
}
//

const styles = StyleSheet.create({
  wrapper: {
    flex: 1
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center"
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
