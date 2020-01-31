/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

export type Person = {
  name: string,
  id: string,
  date: string,
  start: string,
  end: string,
}

export type PersonWithWorkTime = {
  name: string,
  id: string,
  date: string,
  workingHour: int,
  workingMinute:int,
  eveningHour: int,
  eveningMinute:int,
}