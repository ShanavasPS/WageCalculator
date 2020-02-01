/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, { Component } from "react";
import { FlatList, View, Text, Button, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import AsyncStorage from "@react-native-community/async-storage";

import { goToLogin } from "../../navigation";
var RNFS = require("react-native-fs");

export default class Home extends Component {
  render() {
    const { wageArray } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Hi !</Text>
        <Button onPress={this.logout} title="Logout" color="#841584" />
        <Button onPress={this.saveToFile} title="Save to file" color="#841584" />
        <FlatList
          data={wageArray}
          renderItem={({ item }) =>
            <View>
              <Text style={styles.text}>
                {item.id}
              </Text>
              <Text style={styles.text}>
                {item.name}
              </Text>
              <Text style={styles.text}>
                {item.wage}
              </Text>
            </View>}
          keyExtractor={item => item.id}
        />
      </View>
    );
  }
  //

  logout = async () => {
    await AsyncStorage.removeItem("username");
    goToLogin();
  };

  saveToFile = () => {
    const { wageArray } = this.props;

    let individualShift = wageArray.reduce(function(acc, item) {
      return item;
    }, {});

    let date = individualShift.date.split(".");
    let month = date[1];
    if (month.length < 2) {
      month = "0" + month;
    }
    let year = date[2];
    let fileContents = [];
    fileContents.push('Monthly Wages ' + month + "/" + year);

    wageArray.map(item => {
      fileContents.push(item.id + ", " + item.name + ", $" + item.wage.toString());
    });

    console.log('join output is' + fileContents.join("\n"));
    var path = RNFS.DocumentDirectoryPath + "/output.txt";

    // write the file
    RNFS.writeFile(path, fileContents.join("\n"), "utf8")
      .then(success => {
        console.log("FILE WRITTEN!");
      })
      .catch(err => {
        console.log(err.message);
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
