# Monthly Wage Calculator
A React Native application to calculate the monthly wage of all the persons from a CSV file

## Setup Instructions

1. Git clone this repo: `git clone https://github.com/ShanavasPS/WageCalculator.git`
2. Cd to the repo folder: `cd WageCalculator`
3. Install the application with `yarn install` or `npm install`

## Run Instructions - Simulation

* iOS
    * run `react-native run-ios`

* Android
    1. run Android Studio Emulator
    2. run `react-native run-android`

## Run Instructions - Physical device

* for iOS
  1. cd to ios
  2. Open `MonthlyWage.xcworkspace` in Xcode
  3. Choose `MonthlyWage` from the Targets.
  4. Setup `Team` in `Signing & Capabilities` 
  5. Repeat the above step for `MonthlyWageTests` target as well
  6. Click the play button

* Android
  1. Open the project in Android Studio
  2. Run the application

## Running test

`jest` to run the tests
`jest --coverage` to see the coverage reports