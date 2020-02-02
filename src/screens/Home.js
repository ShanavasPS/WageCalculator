/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, { Component } from "react";
import { TouchableOpacity, FlatList, Alert, View, Text, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-community/async-storage";
import { Navigation } from "react-native-navigation";
import { Button } from 'react-native-elements';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
var RNFS = require("react-native-fs");
import { List, ListItem } from "react-native-elements";
import Icon from 'react-native-vector-icons/FontAwesome';
Icon.loadFont();

export default class Home extends Component {
  static get options() {
    return {
      topBar: {
        visible: true,
        title: {
          text: "Report",
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
    const { monthlyWages, fileHeader } = this.props;
    return (
      <View style={styles.wrapper}>
        <FlatList
          data={monthlyWages}
          renderItem={({ item, index }) =>
            <TouchableOpacity onPress={() => this.goToDetails(item.id, item.name)}>
              <ListItem
                roundAvatar
                key={index}
                title={item.name}
                rightTitle={'$' + item.wage}
                leftAvatar={{ source: { uri: 'https://i.picsum.photos/id/' + index + '/200/200.jpg' } }}
                bottomDivider
              />
            </TouchableOpacity>
          }
          keyExtractor={item => item.id}
        />


        <View style={styles.buttonGroup}>
          <Button style={styles.buttonStyle}
            title="Export data"
            onPress={this.saveToFile}
            buttonStyle={{ width: "100%" }}
            type="outline"
          />
        </View>
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
  wrapper: {
    flex: 2,
    justifyContent: "center"
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 100
  },
  buttonStyle: {
    padding: 10
  }
});