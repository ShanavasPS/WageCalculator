/**
 * Monthly Wage App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */
import React, { Component } from "react";
import { TouchableOpacity, FlatList, View, Text, StyleSheet } from "react-native";
import { Navigation } from "react-native-navigation";
import { Button } from 'react-native-elements';
var RNFS = require("react-native-fs");
import { ListItem } from "react-native-elements";
import { showOKAlert } from "./Common"

export default class Home extends Component {
  static get options() {
    return {
      topBar: {
        backButton: {
          color: 'gold'
        },
        visible: true,
        title: {
          text: "Report",
          fontSize: 18
        },
        background: {
          color: '#DF6E57'
        }
      }
    };
  }

  renderHeader = (fileHeader) => (
    <View style={styles.header}>
      <Text style={styles.headerText}>Monthly Wages</Text>
      <Button title="Export data"
        buttonStyle={styles.exportButton}
        onPress={this.saveToFile}
        type="outline"
        color="white"
        titleStyle={styles.exportTitle}
      />
    </View>
  )

  render() {
    const { monthlyWages, fileHeader } = this.props;
    return (
      <View style={styles.wrapper}>
        <FlatList
          data={monthlyWages}
          renderItem={({ item, index }) =>
            <TouchableOpacity onPress={() => this.goToDetails(item.id, item.name)}>
              <ListItem
                containerStyle={styles.flatList}
                roundAvatar
                key={index}
                title={item.name}
                rightTitle={'$' + item.wage}
                rightTitleStyle={styles.gold}
                leftAvatar={{ source: { uri: 'https://i.picsum.photos/id/' + index + '/200/200.jpg' } }}
                bottomDivider
                chevron={styles.gold}
              />
            </TouchableOpacity>
          }
          stickyHeaderIndices={[0]}
          ListHeaderComponent={() => this.renderHeader(fileHeader)}
          keyExtractor={item => item.id}
        />
      </View>
    );
  }

  //Method to save the shift data to a file in the directory folder
  saveToFile = () => {
    const { monthlyWages, fileHeader } = this.props;
    let fileContents = [];
    fileContents.push(fileHeader);
    monthlyWages.map(item => {
      fileContents.push(
        item.id + ", " + item.name + ", $" + item.wage.toString()
      );
    });

    let filename = "monthlywages.txt";
    let path = RNFS.DocumentDirectoryPath + "/" + filename;

    // write the file
    RNFS.writeFile(path, fileContents.join("\n"), "utf8")
      .then(success => {
        showOKAlert("Save success", "The monthly wages has been successfully saved to " + filename);
      })
      .catch(err => {
        showOKAlert("Save failed", err.message);
      });
  };

  //Method to navigate to the selected shift
  goToDetails = (id, name) => {
    const { shifts } = this.props;
    let detailedShifts = shifts.filter(item => item.id == id);
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
    justifyContent: "center",
    backgroundColor: '#DF6E57'
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    marginBottom: 100
  },
  buttonStyle: {
    borderColor: 'red',
    backgroundColor: '#FFD700',
    width: "100%",
  },
  header: {
    padding: 20,
    borderBottomColor: '#FFD700',
    borderBottomWidth: 0.5,
    backgroundColor: '#DF6E57',
    borderTopColor: '#FFD700',
    borderTopWidth: 0.5,
    alignItems: "center",
    justifyContent: "space-around",
    flexDirection: "row",
  },
  headerText: {
    fontSize: 16,
    alignItems: "center",
  },
  flatList: {
    backgroundColor: '#DF6E57'
  },
  exportButton: { 
    borderColor: '#FFD700', 
    backgroundColor: '#FFD700' 
  },
  exportTitle: { 
    color: 'black' 
  },
  gold: { 
    color: 'gold' 
  }
});