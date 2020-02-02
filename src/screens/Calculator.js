/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import React, { Component } from "react";
import type { Shift, ShiftWithWorkHours, PersonWithWage } from "../../types";

export function extractShiftsFromCSVFile(contents) {
    var splitShifts = contents.split("\n");
    let shifts: [Person] = splitShifts.map(item => {
      let shift = item.split(",");
      return (Person = {
        name: shift[0],
        id: shift[1],
        date: shift[2],
        start: shift[3],
        end: shift[4]
      });
    });
    return shifts;
  }
export function removeHeaderAndFooter(shifts) {
  //Remove the header from the CSV file format
  shifts.splice(0, 1);
  //Remove the last blank entry
  shifts.splice(shifts.length - 1, 1);
  return shifts;
};

export function calculateTotalAndEveningHours(shifts) {
  return shifts.map(shift => {
    return this.calculateTotalAndEveningHoursForShift(shift);
  });
};

export function calculateOvertimeHours(shifts) {
  return shifts.map(shift => {
    return (ShiftWithWorkHours = {
      ...shift,
      overtimeHours: this.getOvertimeHours(shift.totalHours)
    });
  });
};

export function getOvertimeHours(hours) {
  return Math.max(0, hours - Constants.OVERTIME_THRESHOLD);
};

export function getHoursFromTime(time) {
  let hourMin = time.split(":");
  let hour = parseInt(hourMin[0]);
  let min = parseInt(hourMin[1]);
  return hour + min / 60;
};

export function findUniquePersonsInTheShifts(shiftsWithWorkHours) {
  let uniquePersons = [];
  shiftsWithWorkHours.map(item => {
    if (uniquePersons.indexOf(item.id) === -1) {
      uniquePersons.push(item.id);
    }
  });
  return uniquePersons;
};

export function sortPersons(persons) {
  persons.sort((a, b) => a - b);
  return persons;
};

export function getFileHeader(shiftsWithWorkHours) {
  let singleShift = this.getPersonDetails(shiftsWithWorkHours);
  let date = singleShift.date.split(".");
  let month = date[1];
  if (month.length < 2) {
    month = "0" + month;
  }
  let year = date[2];
  return "Monthly Wages " + month + "/" + year;
};

export function calculateMonthlyWageForAllThePersons(shiftsWithWorkHours, uniquePersons) {
  //Now separate each person from the list using their id
  return uniquePersons.map(id => {
    return this.calculateMonthlyWage(shiftsWithWorkHours, id);
  });
};

export function calculateMonthlyWage(shiftsWithWorkHours, id) {
  //Extarct the shifts of the current person
  let shifts = this.getTheShiftsOfThePersonWithId(shiftsWithWorkHours, id);

  let totalWage = this.calculateTotalWageForAllTheShifts(shifts);

  let person = this.getPersonDetails(shifts);

  return (PersonWithWage = {
    id: person.id,
    name: person.name,
    date: person.date,
    wage: parseFloat(totalWage.toFixed(2))
  });
};

export function getTheShiftsOfThePersonWithId(shifts, id) {
  return shifts.filter(item => item.id == id);
};

export function getPersonDetails(shifts) {
  return shifts.reduce(function(acc, item) {
    return item;
  }, {});
};

export function calculateTotalWageForAllTheShifts(shifts) {
  return shifts.reduce(
    (prevValue, currentValue) => prevValue + currentValue.wage,
    0
  );
};

export function combineMultipleShifts(shifts) {
  //Combine mutliple shifts into one.
  let uniqueShifts = [];
  shifts.map(item => {
    //filter the current array to find if it already has the shift
    let shift = uniqueShifts.filter(
      shift => shift.date === item.date && shift.id == item.id
    );
    //Check if filtered array contains an element.
    if (shift.length > 0) {
      //If yes, add the total hours and evening hours
      let index = uniqueShifts.indexOf(shift[0]);
      if (index != -1) {
        uniqueShifts[index].totalHours += item.totalHours;
        uniqueShifts[index].eveningHours += item.eveningHours;
      }
    } else {
      //If not, add the new shift to the array
      uniqueShifts.push(item);
    }
  });
  return uniqueShifts;
};

//Calculate wage for every day
export function calculateWageForEachShift(uniqueShifts) {
  return uniqueShifts.map(shift => {
    return (ShiftWithWorkHours = {
      ...shift,
      wage: this.calculateWage(shift.totalHours, shift.eveningHours)
    });
  });
};

export function calculateWage(totalHours, eveningHours) {
  let overtimeHours = Math.max(0, totalHours - Constants.OVERTIME_THRESHOLD);

  eveningHours = overtimeHours > 0 ? 0 : eveningHours;

  let regularHours = totalHours - overtimeHours - eveningHours;

  //Regular daily wage = Regular working hours * Hourly rate
  let regularWage = regularHours * Constants.HOURLY_RATE;

  //Evening wage = Evening working hours * Evening compensation rate
  let eveningWage = eveningHours * Constants.EVENING_COMPENSATION_RATE;

  //calculate the Overtime wage
  let overtimeWage = this.getOvertimeWage(overtimeHours);

  //Total daily pay = Regular daily wage + Evening work compensation
  // + Overtime compensation
  let totalWage = regularWage + overtimeWage + eveningWage;

  //Get the wage with precision to the nearest cent
  return parseFloat(totalWage.toFixed(2));
};

//calculates the overtime wage for the given overtime hours
export function getOvertimeWage(overtimeHours) {
  let overtimeWage = 0;

  //Find the overtime hours eligible for additional quarter hourly rate
  let quarterOvertimeHours = this.getOvertime(
    0,
    Constants.QUARTER_OVERTIME_THRESHOLD,
    overtimeHours
  );

  //Find the overtime hours eligible for additional half hourly rate
  let halfOvertimeHours = this.getOvertime(
    Constants.QUARTER_OVERTIME_THRESHOLD,
    Constants.HALF_OVERTIME_THRESHOLD,
    overtimeHours
  );

  //Find the overtime hours eligible for additional full hourly rate
  let fullOvertimeHours = this.getOvertime(
    Constants.HALF_OVERTIME_THRESHOLD,
    overtimeHours,
    overtimeHours
  );

  overtimeWage =
    quarterOvertimeHours * Constants.QUARTER_OVERTIME_RATE +
    halfOvertimeHours * Constants.HALF_OVERTIME_RATE +
    fullOvertimeHours * Constants.FULL_OVERTIME_RATE;
  return overtimeWage;
};

//This method calculates the hours between the control and hours
//by using a limit threshold
export function getOvertime(control, limit, hours) {
  return Math.min(Math.max(0, limit - control), Math.max(0, hours - control));
};

//Calculate the total hours and evening hours for a given shift
export function calculateTotalAndEveningHoursForShift(shift) {
  let startHour = this.getHoursFromTime(shift.start);
  let endHour = this.getHoursFromTime(shift.end);
  let totalHours = Math.abs(endHour - startHour);
  let eveningHours = this.calculateEveningHours(totalHours, startHour, endHour);

  return (ShiftWithWorkHours = {
    ...shift,
    totalHours: totalHours,
    eveningHours: eveningHours
  });
};

//Calculates the evening hours worked for the given time periods
export function calculateEveningHours(totalHours, startHour, endHour) {
  let eveningHours =
    this.getEveningHours(startHour) + this.getEveningHours(endHour);
  //Making sure evening hours are not greater than total hours
  //in case the shift started and ended within the evening time
  eveningHours = Math.min(totalHours, eveningHours);
  return eveningHours;
};

//Calculates the hours worked for the given hours
export function getEveningHours(hour) {
  return (
    Math.max(0, Constants.EVENING_WORK_END_TIME - hour) +
    Math.max(0, hour - Constants.EVENING_WORK_BEGIN_TIME)
  );
};
