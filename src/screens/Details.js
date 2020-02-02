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
import { ListItem } from "react-native-elements";

export default class Details extends Component {

  static get options() {
    return {
      topBar: {
        visible: true,
        title: {
          text: "Details",
          color: '#2089DC',
          fontSize: 18
        },
        background: {
          color: '#FFFFFF'
        }
      }
    };
  }

  render() {
    // show loading indicator
    const { name, detailedShifts } = this.props;
    return (
      <View style={styles.wrapper}>
        <FlatList
          data={detailedShifts}
          renderItem={({ item, index }) => (

            <ListItem
              key={index}
              title={item.date}
              rightTitle={'$' + item.wage}
              subtitle={'Total\nEvening\nOvertime'}
              subtitleStyle={styles.subtitle}
              rightSubtitle={item.totalHours + 'h\n' + item.eveningHours + 'h\n' + item.overtimeHours + 'h'}
              bottomDivider
            />

          )}
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
  },
  subtitle: {
    fontSize: 14,
    padding: 5
  }
});