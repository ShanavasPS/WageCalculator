/**
 * @format
 */

import Icon from "react-native-vector-icons/FontAwesome";

(function() {
  Promise.all([
    Icon.getImageSource("home", 11), // name of icon, size
    Icon.getImageSource("image", 11),
    Icon.getImageSource("rss-square", 11)
  ]).then(async values => {
    global.icons = values; // make it available globally so we don't need to load it again
  });
})();
