/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

// src/screens/Loading.js
import React, { Component } from "react";
import {
  FlatList,
  View,
  Text,
  ActivityIndicator,
  StyleSheet
} from "react-native";
import AsyncStorage from "@react-native-community/async-storage";

export default class Details extends Component {

  render() {
    // show loading indicator
    const { name, detailedShifts } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.text}>
          {name}
        </Text>
        <FlatList
          data={detailedShifts}
          renderItem={({ item }) =>
            <View>
              <Text style={styles.text}>
                {item.date}, {item.totalHours}, {item.eveningHours},{" "}
                {item.overtimeHours}, ${item.wage}
              </Text>
            </View>}
          keyExtractor={item => item.date}
        />
      </View>
    );
  }
}
//

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  }
});
