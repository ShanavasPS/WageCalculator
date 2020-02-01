/**
 * @format
 */

import { Navigation } from "react-native-navigation";
import Loading from "./src/screens/Loading"; // the loading screen

Navigation.registerComponent(`LoadingScreen`, () => Loading);

Navigation.events().registerAppLaunchedListener(() => {
  // set the root component
  Navigation.setRoot({
    root: {
      component: {
        name: "LoadingScreen"
      }
    }
  });
});
