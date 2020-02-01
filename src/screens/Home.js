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

export default class Home extends Component {
  render() {
    const { wageArray } = this.props;
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Hi !</Text>
        <Button onPress={this.logout} title="Logout" color="#841584" />
        <FlatList
        data={wageArray}
        renderItem={({ item }) => (
          <View>
          <Text style={styles.text}>{item.id}</Text>
          <Text style={styles.text}>{item.name}</Text>
          <Text style={styles.text}>{item.wage}</Text>
          </View>
        )}
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
