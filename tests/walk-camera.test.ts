import { test } from "node:test";
import { strict as assert } from "node:assert";
import { nearestPanelHit } from "../src/walk-render";
const quad = (depth: number) => [
  { x: 0, y: 0, depth },
  { x: 10, y: 0, depth },
  { x: 10, y: 10, depth },
  { x: 0, y: 10, depth },
];
test("overlapping projected panels select the closest visible panel", () => {
  assert.equal(
    nearestPanelHit(
      [
        { id: 1, corners: quad(3) },
        { id: 2, corners: quad(1) },
      ],
      5,
      5,
    ),
    2,
  );
  assert.equal(
    nearestPanelHit(
      [
        { id: 1, corners: quad(-1) },
        { id: 2, corners: quad(3) },
      ],
      5,
      5,
    ),
    2,
  );
  assert.equal(nearestPanelHit([{ id: 1, corners: quad(1) }], 15, 5), null);
});
