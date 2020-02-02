/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

export type Shift = {
  name: string,
  id: string,
  date: string,
  start: string,
  end: string,
}

export type ShiftWithWorkHours = {
  name: string,
  id: string,
  date: string,
  totalHours: int,
  eveningHours: int,
}

export type PersonWithWage= {
  id: string,
  name: string,
  date: string,
  wage: float,
}

export type PersonID= {
  name: string,
  id: string,
}