/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import {
  FlatList,
  View,
  Text,
  StyleSheet
} from "react-native";
import { ListItem } from "react-native-elements";

export default class Details extends Component {

  static get options() {
    return {
      topBar: {
        visible: true,
        title: {
          text: "Details",
          fontSize: 18
        },
        background: {
          color: '#FBFCFC'
        },
      }
    };
  }

  renderHeader = (name) => (
    <View style={styles.header}>
      <Text style={styles.headerText}>Wage Details for {name}</Text>
    </View>
  )

  render() {
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
          ListHeaderComponent={this.renderHeader(name)}
          stickyHeaderIndices={[0]}
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
  },
  header: {
    padding: 20,
    borderBottomColor: '#D0D3D4',
    borderBottomWidth: 0.5,
    backgroundColor: '#FFFFFF',
    borderTopColor: '#D0D3D4',
    borderTopWidth: 0.5,
    alignItems: "center",
  },
  headerText: {
    fontSize: 16,
    alignItems: "center"
  }
});