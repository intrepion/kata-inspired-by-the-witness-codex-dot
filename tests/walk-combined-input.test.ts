import { test } from "node:test";
import assert from "node:assert/strict";
import { DragLook, MouseLook } from "../src/walk-input";
import { movePlayer, type Camera } from "../src/walk-domain";

const start: Camera = { x: 0, y: 1.65, z: 8, yaw: 0, pitch: 0 };

test("unlocked drag turns while forward movement continues, without dropping either input", () => {
  const look = new DragLook();
  look.begin(100, 100);
  let player = { ...start };
  for (let frame = 1; frame <= 10; frame++) {
    Object.assign(player, look.turn(player, 100 + frame * 10, 100 - frame));
    player = { ...player, ...movePlayer(player, Math.sin(player.yaw) * 0.04, -Math.cos(player.yaw) * 0.04, []) };
  }
  assert.ok(player.x > start.x);
  assert.ok(player.z < start.z);
  assert.ok(Math.abs(player.yaw - 0.24) < 1e-10);
  assert.ok(Math.abs(player.pitch - 0.024) < 1e-10);
});

test("locked mouse turns survive interleaved movement frames", () => {
  const look = new MouseLook();
  let player = { ...start };
  look.turn(player, { movementX: 0, movementY: 0, timeStamp: 0 });
  for (let frame = 1; frame <= 10; frame++) {
    Object.assign(player, look.turn(player, { movementX: 10, movementY: 0, timeStamp: frame * 16 }));
    player = { ...player, ...movePlayer(player, 0.04, -0.04, []) };
  }
  assert.ok(Math.abs(player.yaw - 0.24) < 1e-10);
  assert.ok(player.x > start.x && player.z < start.z);
});

test("ending a drag on release, pause, or capture acquisition prevents stale movement", () => {
  const look = new DragLook();
  assert.deepEqual(look.turn(start, 500, 500), start);
  look.begin(10, 10);
  look.end();
  assert.deepEqual(look.turn(start, 500, 500), start);
  look.begin(500, 500);
  assert.deepEqual(look.turn(start, 500, 500), { yaw: 0, pitch: 0 });
});

test("drag look bounds pitch and ignores non-finite coordinates", () => {
  const look = new DragLook();
  look.begin(0, 0);
  assert.deepEqual(look.turn(start, NaN, 0), start);
  assert.equal(look.turn(start, 0, -1000).pitch, 1.1);
});

