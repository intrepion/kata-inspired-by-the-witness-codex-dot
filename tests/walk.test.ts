import { test } from "node:test";
import assert from "node:assert/strict";
import {
  movePlayer,
  colliders,
  freshWalk,
  solvePanel,
  restoreWalk,
  arrive,
  panels,
} from "../src/walk-domain";

test("a closed gate blocks walking and its validated solution opens the passage", () => {
  let save = freshWalk();
  const blocked = movePlayer({ x: 0, z: 1 }, 0, -3, colliders(save));
  assert.ok(blocked.z > 0.4);
  save = solvePanel(save, 0, panels[0].puzzle.solution);
  assert.ok(
    Math.abs(movePlayer({ x: 0, z: 1 }, 0, -3, colliders(save)).z + 2) < 1e-9,
  );
  assert.equal(Object.keys(save.solved).length, 1);
});

test("missed seeds cannot unlock a gate; valid progression survives reload without trusting flags", () => {
  let save = freshWalk();
  assert.equal(solvePanel(save, 1, panels[1].puzzle.solution), save);
  save = solvePanel(save, 0, panels[0].puzzle.solution);
  assert.equal(
    solvePanel(save, 1, [
      [0, 2],
      [1, 2],
      [2, 2],
      [2, 1],
      [2, 0],
    ]),
    save,
  );
  save = solvePanel(save, 1, panels[1].puzzle.solution);
  assert.deepEqual(restoreWalk(JSON.stringify(save)), save);
  assert.equal(
    restoreWalk('{"version":1,"solved":{"0":true},"arrived":true}').arrived,
    false,
  );
  assert.equal(
    Object.keys(
      restoreWalk('{"version":1,"solved":{"2":[[0,3],[3,0]]}}').solved,
    ).length,
    0,
  );
  assert.equal(Object.keys(restoreWalk("broken").solved).length, 0);
});

test("completion requires walking beyond the last solved gate and solids cannot be tunneled through", () => {
  let save = freshWalk();
  assert.equal(arrive(save, { x: 0, z: -25 }).arrived, false);
  for (const p of panels)
    save = solvePanel(save, p.puzzle.id, p.puzzle.solution);
  assert.equal(arrive(save, { x: 0, z: -19 }).arrived, false);
  assert.equal(arrive(save, { x: 0, z: -25 }).arrived, true);
  assert.ok(movePlayer({ x: 0, z: 8 }, 100, 0, colliders(save)).x < 6.73);
  const slide = movePlayer({ x: 6.6, z: 8 }, 1, -2, colliders(save));
  assert.ok(slide.x < 6.73 && slide.z < 7);
});
