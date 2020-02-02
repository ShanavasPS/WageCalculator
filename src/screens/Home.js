/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, { Component } from "react";
import {TouchableOpacity, FlatList, Alert, View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { Navigation } from "react-native-navigation";

var RNFS = require("react-native-fs");

export default class Home extends Component {
  render() {
    const { monthlyWages, fileHeader } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {fileHeader}
        </Text>
        <FlatList
          data={monthlyWages}
          renderItem={({ item }) =>
            <TouchableOpacity onPress={() => this.goToDetails(item.id, item.name)}>
              <View>
                <Text style={styles.text}>
                  {item.id}, {item.name}, ${item.wage}
                </Text>
              </View>
            </TouchableOpacity>}
          keyExtractor={item => item.id}
        />
        <Button
          onPress={this.saveToFile}
          title="Save date to a file"
          color="#841584"
        />
      </View>
    );
  }

  saveToFile = () => {
    const { monthlyWages, fileHeader } = this.props;
    let fileContents = [];
    fileContents.push(fileHeader);
    monthlyWages.map(item => {
      fileContents.push(
        item.id + ", " + item.name + ", $" + item.wage.toString()
      );
    });

    let filename = "output.txt";
    let path = RNFS.DocumentDirectoryPath + "/" + filename;

    // write the file
    RNFS.writeFile(path, fileContents.join("\n"), "utf8")
      .then(success => {
        Alert.alert(
          "Save success",
          "The monthly wages has been successfully saved to " + filename,
          [{ text: "OK" }],
          { cancelable: false }
        );
      })
      .catch(err => {
        console.log(err.message);
        Alert.alert("Save failed", err.message, [{ text: "OK" }], {
          cancelable: false
        });
      });
  };

  goToDetails = (id, name) => {
    const { shiftsWithWages } = this.props;
    let detailedShifts = shiftsWithWages.filter(item => item.id == id);
    Navigation.push(this.props.componentId, {
      component: {
        name: "DetailsScreen",
        passProps: {
          detailedShifts,
          name,
        }
      }
    });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  text: {
    fontSize: 18,
    fontWeight: "bold"
  }
});
