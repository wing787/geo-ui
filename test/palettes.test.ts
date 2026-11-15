import assert from "node:assert/strict";
import { test } from "node:test";
import {
  categorical,
  classIndex,
  colorStops,
  convention,
  diverging,
  image,
  jmaRainFor,
  optional,
  sequential,
  stepArgs,
} from "../src/palettes.ts";

const HEX = /^#[0-9a-f]{6}$/;

test("all palette values are lowercase 6-digit hex", () => {
  const all = [
    ...Object.values(sequential).flat(),
    ...Object.values(categorical).flat(),
    ...diverging,
    ...Object.values(image).flat(),
    ...Object.values(optional).flat(),
    ...Object.values(convention).flatMap((p) => ("colors" in p ? p.colors : p)),
  ];
  for (const color of all) assert.match(color, HEX);
});

test("themed sequential ramps are the full ramp, oriented and trimmed by one stop", () => {
  assert.deepEqual(sequential.dark, sequential.full.slice(1));
  assert.deepEqual(sequential.light, [...sequential.full].reverse().slice(1));
});

test("categorical palettes have 5 distinct colors per theme", () => {
  for (const colors of Object.values(categorical)) {
    assert.equal(colors.length, 5);
    assert.equal(new Set(colors).size, 5);
  }
});

test("diverging and anomaly palettes have an odd number of classes", () => {
  assert.equal(diverging.length, 11);
  assert.equal(convention.jmaAnomalyTemperature.length, 11);
  assert.equal(convention.jmaAnomalyPrecipitation.length, 11);
});

test("classed convention palettes have one more color than edges, edges increasing", () => {
  for (const palette of [convention.jmaRain, convention.jmaTemperature]) {
    assert.equal(palette.colors.length, palette.edges.length + 1);
    assert.doesNotThrow(() => stepArgs(palette));
  }
});

test("jmaRainFor drops the near-white first class on dark backgrounds only", () => {
  const light = jmaRainFor("light");
  assert.deepEqual(light.colors, convention.jmaRain.colors);
  assert.equal(light.drawFrom, 0);

  const dark = jmaRainFor("dark");
  assert.equal(dark.drawFrom, 1);
  assert.deepEqual(dark.edges, [5, 10, 20, 30, 50, 80]);
  assert.equal(dark.colors[0], "#a0d2ff");
  assert.equal(dark.colors.at(-1), "#b40068");
  assert.ok(!dark.colors.includes("#f2f2ff"));
});

test("classIndex puts boundary values in the upper class", () => {
  const { edges } = convention.jmaRain;
  assert.equal(classIndex(0, edges), 0);
  assert.equal(classIndex(0.9, edges), 0);
  assert.equal(classIndex(1, edges), 1);
  assert.equal(classIndex(12, edges), 3);
  assert.equal(classIndex(80, edges), 7);
  assert.equal(classIndex(300, edges), 7);
  assert.throws(() => classIndex(Number.NaN, edges), RangeError);
});

test("stepArgs builds MapLibre step arguments and rejects malformed palettes", () => {
  assert.deepEqual(stepArgs({ edges: [1, 5], colors: ["#000000", "#808080", "#ffffff"] }), [
    "#000000",
    1,
    "#808080",
    5,
    "#ffffff",
  ]);
  assert.throws(() => stepArgs({ edges: [1, 5], colors: ["#000000", "#ffffff"] }), RangeError);
  assert.throws(() => stepArgs({ edges: [5, 1], colors: ["#000000", "#808080", "#ffffff"] }), RangeError);
});

test("colorStops spreads colors evenly and keeps both ends exact", () => {
  assert.deepEqual(colorStops(["#000000", "#808080", "#ffffff"], 0, 80), [
    [0, "#000000"],
    [40, "#808080"],
    [80, "#ffffff"],
  ]);
  const stops = colorStops(sequential.full, -5, 35);
  assert.equal(stops[0][0], -5);
  assert.equal(stops.at(-1)?.[0], 35);
});

test("colorStops rejects invalid input", () => {
  assert.throws(() => colorStops(["#000000"], 0, 1), RangeError);
  assert.throws(() => colorStops(["#000000", "#ffffff"], 1, 1), RangeError);
  assert.throws(() => colorStops(["#000000", "#ffffff"], 0, Number.NaN), RangeError);
});
