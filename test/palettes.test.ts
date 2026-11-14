import assert from "node:assert/strict";
import { test } from "node:test";
import { categorical, colorStops, diverging, sequential } from "../src/palettes.ts";

const HEX = /^#[0-9a-f]{6}$/;

test("all palette values are lowercase 6-digit hex", () => {
  const all = [
    ...Object.values(sequential).flat(),
    ...Object.values(categorical).flat(),
    ...Object.values(diverging).flat(),
  ];
  for (const color of all) assert.match(color, HEX);
});

test("trimmed sequential ramps are contiguous parts of the full ramp", () => {
  const full = sequential.full.join(",");
  assert.ok(full.startsWith(sequential.light.join(",")));
  assert.ok(full.endsWith(sequential.dark.join(",")));
});

test("categorical palettes have 5 distinct colors per theme", () => {
  for (const colors of Object.values(categorical)) {
    assert.equal(colors.length, 5);
    assert.equal(new Set(colors).size, 5);
  }
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
