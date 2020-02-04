/**
 * @format
 */

import { Navigation } from "react-native-navigation";
import { goToLandingScreen } from "./navigation"; 

Navigation.events().registerAppLaunchedListener(() => {
  Navigation.setDefaultOptions({
    animations: {
      setRoot: {
        waitForRender: true,
      },
      put: {
        waitForRender: true,
      },
      push: {
        waitForRender: true,
      },
    },
  })

  goToLandingScreen();
});
