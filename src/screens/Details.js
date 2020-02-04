/**
 * Monthly Wage App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import { FlatList, View, Text, StyleSheet } from "react-native";
import { ListItem } from "react-native-elements";

export default class Details extends Component {
  static get options() {
    return {
      topBar: {
        backButton: {
          color: 'gold'
        },
        visible: true,
        title: {
          text: "Details",
          fontSize: 18
        },
        background: {
          color: '#DF6E57'
        },
      }
    };
  }

  renderHeader = name =>
    <View style={styles.header}>
      <Text style={styles.headerText}>
        Wage Details for {name}
      </Text>
    </View>;

  render() {
    const { name, detailedShifts } = this.props;
    return (
      <View style={styles.wrapper}>
        <FlatList
          data={detailedShifts}
          renderItem={({ item, index }) =>
            <ListItem
              containerStyle={styles.flatList}
              key={index}
              title={item.date}
              rightTitle={
                <Text style={styles.rightTitle}>
                  ${item.wage}
                </Text>
              }
              subtitle={
                <View style={styles.subtitle}>
                  <Text>Total Hours</Text>
                  <Text>Evening Hours</Text>
                  <Text>Overtime Hours</Text>
                </View>
              }
              rightSubtitle={
                <View style={styles.rightSubtitle}>
                  <Text style={styles.rightSubtitle}>
                    {item.totalHours} h
                  </Text>
                  <Text style={styles.rightSubtitle}>
                    {item.eveningHours} h
                  </Text>
                  <Text style={styles.rightSubtitle}>
                    {item.overtimeHours} h
                  </Text>
                </View>
              }
              bottomDivider
            />}
          keyExtractor={item => item.date}
          ListHeaderComponent={this.renderHeader(name)}
          stickyHeaderIndices={[0]}
          rightTitleStyle={{ color: 'gold' }}
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
    alignItems: "center",
    backgroundColor: '#DF6E57'
  },
  subtitle: {
    fontSize: 14,
    padding: 5,
  },
  rightSubtitle: {
    alignItems: "flex-end",
    color: "#2A2A2A",
  },
  rightTitle: {
    alignItems: "flex-end",
    fontSize: 16,
    paddingVertical: 5,
    color: 'gold'
  },
  header: {
    padding: 20,
    borderBottomColor: '#FFD700',
    borderBottomWidth: 0.5,
    backgroundColor: '#DF6E57',
    borderTopColor: '#FFD700',
    borderTopWidth: 0.5,
    alignItems: "center"
  },
  headerText: {
    fontSize: 16,
    alignItems: "center"
  },
  wrapper: {
    backgroundColor: '#DF6E57'
  },
  flatList: {
    backgroundColor: '#DF6E57'
  }
});