/**
 * @format
 */

import "react-native";

import {
  getOvertimeHours,
  getEveningHours,
  sortPersons,
  findUniquePersonsInTheShifts,
  calculateEveningHours,
  calculateTotalAndEveningHours,
  calculateTotalAndEveningHoursForShift,
  extractShiftsFromCSVFile,
  removeHeader,
  getHoursFromTime,
  getFileHeader,
  getTheShiftsOfThePersonWithId,
  calculateWage,
  getOvertimeWage
} from "../src/screens/Calculator";

it("getOvertimeHours should return 6 for input 14", () => {
  let overtime = getOvertimeHours(14);
  expect(overtime).toEqual(6);
});

it("getOvertimeHours should return 0 for input 8", () => {
  let overtime = getOvertimeHours(8);
  expect(overtime).toEqual(0);
});

it("getOvertimeHours should return 0 for input < 8", () => {
  let overtime = getOvertimeHours(5);
  expect(overtime).toEqual(0);
});

it("getEveningHours should return 0 for input 6", () => {
  let hours = getEveningHours(6);
  expect(hours).toEqual(0);
});

it("getEveningHours should return 1 for input 5", () => {
  let hours = getEveningHours(5);
  expect(hours).toEqual(1);
});

it("getEveningHours should return 1 for input 23", () => {
  let hours = getEveningHours(23);
  expect(hours).toEqual(4);
});

it("calculateEveningHours should return a value less than or equal to total hours", () => {
  expect(calculateEveningHours(2, 4, 6)).toEqual(2);
});

it("calculateEveningHours should return a value less than or equal to total hours", () => {
  expect(calculateEveningHours(5, 3, 8)).toEqual(3);
});

it("calculateEveningHours should return the sum of early and evening hours", () => {
  expect(calculateEveningHours(17, 5, 22)).toEqual(4);
});

let ids = ["3", "1", "2", "4", "6", "5"];
let sortedIds = ["1", "2", "3", "4", "5", "6"];
it("sortPersons should return ids in incremental order", () => {
  expect(sortPersons(ids)).toEqual(sortedIds);
});

let shifts = [
  { name: "Jenet", id: "2", date: "23.2.2015", start: "10:00", end: "16:00" },
  { name: "Tom", id: "1", date: "23.2.2015", start: "06:00", end: "8:00" },
  { name: "Levar", id: "1", date: "23.2.2015", start: "10:00", end: "12:00" }
];
let uniquePersons = ["2", "1"];
it("findUniquePersonsInTheShifts should return the unique ids", () => {
  expect(findUniquePersonsInTheShifts(shifts)).toEqual(uniquePersons);
});

let shift = {
  name: "Jenet",
  id: "2",
  date: "23.2.2015",
  start: "10:00",
  end: "16:00"
};
let shiftWithHours = {
  name: "Jenet",
  id: "2",
  date: "23.2.2015",
  start: "10:00",
  end: "16:00",
  totalHours: 6,
  eveningHours: 0
};
it("calculateTotalAndEveningHoursForShift should return total and evening hours", () => {
  expect(calculateTotalAndEveningHoursForShift(shift)).toEqual(shiftWithHours);
});

let csvContents = "Name,id,date,start,end\nJenet,2,23.2.2015,10:00,20:00\nTom,1,23.2.2015,04:00,8:00\n";
let extractedShifts = [{
  name: "Name",
  id: "id",
  date: "date",
  start: "start",
  end: "end"
},{
  name: "Jenet",
  id: "2",
  date: "23.2.2015",
  start: "10:00",
  end: "20:00"
},{
  name: "Tom",
  id: "1",
  date: "23.2.2015",
  start: "04:00",
  end: "8:00"
}
];
it("extractShiftsFromCSVFile should return the shifts array", () => {
  expect(extractShiftsFromCSVFile(csvContents)).toEqual(extractedShifts);
});

let csvContentsWithoutLastLine = "Name,id,date,start,end\nJenet,2,23.2.2015,10:00,20:00\nTom,1,23.2.2015,04:00,8:00";
it("extractShiftsFromCSVFile should return the shifts array", () => {
  expect(extractShiftsFromCSVFile(csvContentsWithoutLastLine)).toEqual(extractedShifts);
});

let shiftsWithoutHeader = [{
  name: "Jenet",
  id: "2",
  date: "23.2.2015",
  start: "10:00",
  end: "20:00"
},{
  name: "Tom",
  id: "1",
  date: "23.2.2015",
  start: "04:00",
  end: "8:00"
}
];

it("removeHeader should remove the first entry from the array", () => {
  expect(removeHeader(extractedShifts)).toEqual(shiftsWithoutHeader);
});

let shiftsWithTotalAndEveningHours = [{
  name: "Jenet",
  id: "2",
  date: "23.2.2015",
  start: "10:00",
  end: "20:00",
  totalHours: 10,
  eveningHours: 1
},{
  name: "Tom",
  id: "1",
  date: "23.2.2015",
  start: "04:00",
  end: "8:00",
  totalHours: 4,
  eveningHours: 2
}
];

it("calculateTotalAndEveningHours calculate correct total and evening hours", () => {
  expect(calculateTotalAndEveningHours(shiftsWithoutHeader)).toEqual(shiftsWithTotalAndEveningHours);
});

it("getHoursFromTime should return time in decimal format", () => {
  expect(getHoursFromTime("12:30")).toEqual(12.5);
});

it("getHoursFromTime should return time in decimal format", () => {
  expect(getHoursFromTime("04:45")).toEqual(4.75);
});

it("getHoursFromTime should return time in decimal format", () => {
  expect(getHoursFromTime("19:00")).toEqual(19);
});

it("getHoursFromTime should return time in decimal format", () => {
  expect(getHoursFromTime("00:15")).toEqual(0.25);
});

it("getFileHeader should return the string with month and year", () => {
  expect(getFileHeader(shiftsWithTotalAndEveningHours)).toEqual("Monthly Wages 02/2015");
});

let shiftsOfPerson2 = [{
  name: "Jenet",
  id: "2",
  date: "23.2.2015",
  start: "10:00",
  end: "20:00",
  totalHours: 10,
  eveningHours: 1
}
];

it("getTheShiftsOfThePersonWithId should return the only the shifts with the given id", () => {
  expect(getTheShiftsOfThePersonWithId(shiftsWithTotalAndEveningHours, "2")).toEqual(shiftsOfPerson2);
});

it("calculateWage should return the correct wage for the given hours", () => {
  expect(calculateWage(8, 0)).toEqual(34);
});

it("calculateWage should return the correct wage for the given hours", () => {
  expect(calculateWage(10, 0)).toEqual(44.63);
});

it("calculateWage should return the correct wage for the given hours", () => {
  expect(calculateWage(11.25, 0)).toEqual(51.53);
});

it("calculateWage should return the correct wage for the given hours", () => {
  expect(calculateWage(12.25, 0)).toEqual(58.44);
});

it("calculateWage should return the correct wage for the given hours", () => {
  expect(calculateWage(2, 2)).toEqual(11);
});

it("getOvertimeWage should return the overtime wage for the given hours", () => {
  expect(getOvertimeWage(0)).toEqual(0);
});

it("getOvertimeWage should return the overtime wage for the given hours", () => {
  expect(getOvertimeWage(2)).toEqual(10.63);
});

it("getOvertimeWage should return the overtime wage for the given hours", () => {
  expect(getOvertimeWage(3.25)).toEqual(17.53);
});

it("getOvertimeWage should return the overtime wage for the given hours", () => {
  expect(getOvertimeWage(4.25)).toEqual(24.44);
});


