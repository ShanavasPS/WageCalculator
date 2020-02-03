/**
 * @format
 */

import "react-native";
import React from "react";

import { getOvertimeHours, getEveningHours, calculateEveningHours } from "../src/screens/Calculator";

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