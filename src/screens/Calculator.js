/**
 * Monthly Wage App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow
 */

import * as Constants from "../../constants";

//This function removes the header and footer from 
//a given shift so it only has proper shift data
export function removeHeaderAndFooter(shifts) {
  //Remove the header from the CSV file format
  if(shifts.length >0) {
    shifts.splice(0, 1);
  }
  //Remove the last blank entry
  if(shifts.length >0) {
    shifts.splice(shifts.length - 1, 1);
  }
  return shifts;
};

//This function iterates through the given shifts
//and calculates the total and evening hours
export function calculateTotalAndEveningHours(shifts) {
  return shifts.map(shift => {
    return calculateTotalAndEveningHoursForShift(shift);
  });
};

//This function calculates the overtime hours
//in a given shift
export function calculateOvertimeHours(shifts) {
  return shifts.map(shift => {
    return ({
      ...shift,
      overtimeHours: getOvertimeHours(shift.totalHours)
    });
  });
};

//This function calculates the overtime hours from the total hours
export function getOvertimeHours(hours) {
  return Math.max(0, hours - Constants.OVERTIME_THRESHOLD);
};

//This function extracts the hour and minute from a given time
//and returns the hours in decimal format.
export function getHoursFromTime(time) {
  let hourMin = time.split(":");
  let hour = parseInt(hourMin[0]);
  let min = parseInt(hourMin[1]);
  return hour + min / 60;
};

//This functions finds the unique persons in the shifts
//and returns an array with their ids
export function findUniquePersonsInTheShifts(shiftsWithWorkHours) {
  let uniquePersons = [];
  shiftsWithWorkHours.map(item => {
    if (uniquePersons.indexOf(item.id) === -1) {
      uniquePersons.push(item.id);
    }
  });
  return uniquePersons;
};

//This function sorts the id of the persons in incremental order
export function sortPersons(persons) {
  persons.sort((a, b) => a - b);
  return persons;
};

//This method extracts the month and year of the shifts
//from a given shifts array
export function getFileHeader(shiftsWithWorkHours) {
  let singleShift = getPersonDetails(shiftsWithWorkHours);
  let date = singleShift.date.split(".");
  let month = date[1];
  if (month.length < 2) {
    month = "0" + month;
  }
  let year = date[2];
  return "Monthly Wages " + month + "/" + year;
};

//This function iterates through the shifts and 
//returns an array with the total wage for each person
export function calculateMonthlyWageForAllThePersons(shiftsWithWorkHours, uniquePersons) {
  return uniquePersons.map(id => {
    return calculateMonthlyWage(shiftsWithWorkHours, id);
  });
};

//This function calculates the monthly wage of a person 
//by filtering shifts using their id.
export function calculateMonthlyWage(shiftsWithWorkHours, id) {
  //Extarct the shifts of the current person
  let shifts = getTheShiftsOfThePersonWithId(shiftsWithWorkHours, id);

  let totalWage = calculateTotalWageForAllTheShifts(shifts);

  let person = getPersonDetails(shifts);

  return ({
    id: person.id,
    name: person.name,
    date: person.date,
    wage: parseFloat(totalWage.toFixed(2))
  });
};

//This method returns the shifts of a particular person filtered by their id.
export function getTheShiftsOfThePersonWithId(shifts, id) {
  return shifts.filter(item => item.id == id);
};

//This function returns the details about a person from their shift,
//including name, id, etc.
export function getPersonDetails(shifts) {
  return shifts.reduce(function(acc, item) {
    return item;
  }, {});
};

//This function iterates through the shifts and addd the wage value
//and returns the sum.
export function calculateTotalWageForAllTheShifts(shifts) {
  return shifts.reduce(
    (prevValue, currentValue) => prevValue + currentValue.wage,
    0
  );
};

//This function combine the mutliple shifts of the same perosn on the same day
export function combineMultipleShifts(shifts) {
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

//This method iterates through all the shifts
//and returns the shifts with its wage for each shift
export function calculateWageForEachShift(uniqueShifts) {
  return uniqueShifts.map(shift => {
    return ({
      ...shift,
      wage: calculateWage(shift.totalHours, shift.eveningHours)
    });
  });
};

//This method calculates the wage for a shift from the total hours and evening hours
export function calculateWage(totalHours, eveningHours) {
  let overtimeHours = Math.max(0, totalHours - Constants.OVERTIME_THRESHOLD);

  eveningHours = overtimeHours > 0 ? 0 : eveningHours;

  let regularHours = totalHours - overtimeHours - eveningHours;

  //Regular daily wage = Regular working hours * Hourly rate
  let regularWage = regularHours * Constants.HOURLY_RATE;

  //Evening wage = Evening working hours * Evening compensation rate
  let eveningWage = eveningHours * Constants.EVENING_COMPENSATION_RATE;

  //calculate the Overtime wage
  let overtimeWage = getOvertimeWage(overtimeHours);

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
  let quarterOvertimeHours = getOvertime(
    0,
    Constants.QUARTER_OVERTIME_THRESHOLD,
    overtimeHours
  );

  //Find the overtime hours eligible for additional half hourly rate
  let halfOvertimeHours = getOvertime(
    Constants.QUARTER_OVERTIME_THRESHOLD,
    Constants.HALF_OVERTIME_THRESHOLD,
    overtimeHours
  );

  //Find the overtime hours eligible for additional full hourly rate
  let fullOvertimeHours = getOvertime(
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
  let startHour = getHoursFromTime(shift.start);
  let endHour = getHoursFromTime(shift.end);
  let totalHours = Math.abs(endHour - startHour);
  let eveningHours = calculateEveningHours(totalHours, startHour, endHour);

  return ({
    ...shift,
    totalHours: totalHours,
    eveningHours: eveningHours
  });
};

//Calculates the evening hours worked for the given time periods
export function calculateEveningHours(totalHours, startHour, endHour) {
  let eveningHours =
    getEveningHours(startHour) + getEveningHours(endHour);
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
