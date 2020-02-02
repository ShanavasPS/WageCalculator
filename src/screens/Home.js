/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, { Component } from "react";
import { FlatList, Alert, View, Text, Button, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { Navigation } from "react-native-navigation";

var RNFS = require("react-native-fs");

export default class Home extends Component {
  render() {
    const { wageArray, fileHeader } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {fileHeader}
        </Text>
        <FlatList
          data={wageArray}
          renderItem={({ item }) =>
            <View>
              <Text style={styles.text}>
                {item.id}, {item.name}, ${item.wage}
              </Text>
            </View>}
          keyExtractor={item => item.id}
        />
        <Button
          onPress={this.saveToFile}
          title="Save date to a file"
          color="#841584"
        />
        <Button
          onPress={this.goToDetails}
          title="Show details"
          color="#841584"
        />
      </View>
    );
  }

  saveToFile = () => {
    const { wageArray, fileHeader } = this.props;
    let fileContents = [];
    fileContents.push(fileHeader);
    wageArray.map(item => {
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
        Alert.alert(
          "Save failed",
          err.message,
          [{ text: "OK" }],
          { cancelable: false }
        );
      });
  };

  goToDetails = () =>
    Navigation.push(this.props.componentId, {
      component: {
        name: "DetailsScreen",
      }
    });

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
