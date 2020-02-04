/**
 * Monthly Wage App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import { Alert } from "react-native";
var RNFS = require("react-native-fs");
import FileViewer from "react-native-file-viewer";

export function showOKAlert(title, description) {
  Alert.alert(
    title,
    description,
    [{ text: "OK" }],
    { cancelable: false }
  );
};

export function getTopBar(title) {
  return {
    topBar: {
      backButton: {
        color: 'gold'
      },
      visible: true,
      title: {
        text: title,
        fontSize: 18
      },
      background: {
        color: '#DF6E57'
      }
    }
  };
}

export function getHeader(title) {
  return {
    topBar: {
      visible: false,
      title: {
        text: title,
        fontSize: 18
      },
      background: {
        color: '#DF6E57'
      }
    }
  };
}

export function getDirectoryPath() {
  return Platform.OS == "ios"
  ? RNFS.DocumentDirectoryPath
  : RNFS.ExternalDirectoryPath;
}

export function writeToFile(filename, fileContents) {
  let dirPath = getDirectoryPath();
  let path = dirPath + "/" + filename;
  // write the file
  RNFS.writeFile(path, fileContents.join("\n"), "utf8")
  .then(success => {
    FileViewer.open(path, { showOpenWithDialog: true }) // absolute-path-to-my-local-file.
      .then(() => {
        // success
      })
      .catch(error => {
        showOKAlert("Save failed", err.message);
      });
  })
  .catch(err => {
    showOKAlert("Save failed", err.message);
  });
}