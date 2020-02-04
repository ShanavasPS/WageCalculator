/**
 * Monthly Wage App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import { Navigation } from "react-native-navigation";

import Landing from "./src/screens/Landing";
import Home from "./src/screens/Home";
import Details from "./src/screens/Details";

Navigation.registerComponent(`LandingScreen`, () => Landing);
Navigation.registerComponent(`HomeScreen`, () => Home);
Navigation.registerComponent(`DetailsScreen`, () => Details);

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

export const goToLandingScreen = () =>
  Navigation.setRoot({
    root: {
      stack: {
        // create a stack navigation
        id: "stackMain",
        children: [
          {
            component: {
              name: "LandingScreen"
            }
          }
        ]
      }
    }
  });