/**
 * Monthly Wage App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { Navigation } from "react-native-navigation";
import { View, StyleSheet, Image, Text } from "react-native";
import DocumentPicker from "react-native-document-picker";
import { Button } from "react-native-elements";
import * as Calculator from "./Calculator";

var RNFS = require("react-native-fs");
import { showOKAlert, getHeader } from "./Common";

export default class Landing extends Component {
  static get options() {
    return getHeader("Monthly Wages");
  }

  render() {
    return (
      <View style={styles.wrapper}>
        <View style={styles.container}>
          <View style={styles.main}>
            <View style={styles.headerView}>
              <Text style={styles.headerText}>Monthly Wages</Text>
              <Image
                style={styles.headerImage}
                source={require("../images/dollar.png")}
              />
              <Text style={styles.description}>
                Seamlessly calculates monthly wages
              </Text>
            </View>
            <View style={styles.bottomView}>
              <Button
                title="Upload CSV File"
                buttonStyle={styles.uploadButton}
                color="black"
                onPress={this.openCSVFile}
                type="outline"
                titleStyle={styles.buttonTitle}
              />
              <Button
                title="Load test CSV File"
                buttonStyle={styles.loadButton}
                onPress={this.loadTestFile}
                type="outline"
                titleStyle={styles.buttonTitle}
              />
            </View>
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
    flex: 1,
    backgroundColor: "#DF6E57"
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
  },
  main: {
    alignContent: "center",
    alignItems: "center",
    justifyContent: "space-around"
  },
  headerView: {
    flex: 1,
    marginTop: 50,
    justifyContent: "flex-end",
    alignItems: "center"
  },
  headerText: {
    padding: 20,
    fontSize: 24,
    width: 300,
    textAlign: "center",
    color: "gold"
  },
  headerImage: {
    width: 150,
    height: 150
  },
  description: {
    padding: 20,
    fontSize: 20,
    width: 300,
    textAlign: "center"
  },
  bottomView: {
    flex: 1,
    justifyContent: "center"
  },
  uploadButton: {
    width: "100%",
    marginBottom: 20,
    borderColor: "#FFD700",
    backgroundColor: "#FFD700"
  },
  loadButton: {
    width: "100%",
    borderColor: "#FFD700",
    backgroundColor: "#FFD700"
  },
  buttonTitle: {
    color: "black"
  }
});
