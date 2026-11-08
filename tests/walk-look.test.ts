import { test } from "node:test";
import assert from "node:assert/strict";
import { MouseLook } from "../src/walk-input";

test("mouse look preserves normal horizontal and vertical sensitivity", () => {
  const look = new MouseLook();
  const view = { yaw: 0, pitch: 0 };
  look.turn(view, { movementX: 0, movementY: 0, timeStamp: 16 });
  assert.deepEqual(
    look.turn(view, { movementX: 100, movementY: -50, timeStamp: 16 }),
    {
      yaw: 0.24,
      pitch: 0.12,
    },
  );
});

test("an isolated movement spike cannot turn the walking view, and normal input recovers immediately", () => {
  const look = new MouseLook();
  const view = { yaw: 0.7, pitch: 0.2 };
  look.turn(view, { movementX: 0, movementY: 0, timeStamp: 16 });
  for (const movement of [
    { movementX: 1200, movementY: 0, timeStamp: 16 },
    { movementX: -1200, movementY: 4, timeStamp: 16 },
    { movementX: 5, movementY: 900, timeStamp: 16 },
    { movementX: 0, movementY: -900, timeStamp: 16 },
  ]) {
    assert.deepEqual(look.turn(view, movement), view);
  }
  assert.deepEqual(
    look.turn(view, { movementX: -100, movementY: 50, timeStamp: 16 }),
    {
      yaw: 0.45999999999999996,
      pitch: 0.08000000000000002,
    },
  );
});

test("capturing or recapturing the mouse discards its first movement instead of snapping the view", () => {
  const look = new MouseLook();
  const view = { yaw: 0.7, pitch: 0.2 };
  // Cursor repositioning can be smaller than the isolated-spike threshold.
  assert.deepEqual(
    look.turn(view, { movementX: -17, movementY: 195, timeStamp: 16 }),
    view,
  );
  const turned = look.turn(view, {
    movementX: 100,
    movementY: 0,
    timeStamp: 16,
  });
  assert.equal(turned.yaw, 0.94);
  look.reset();
  assert.deepEqual(
    look.turn(turned, { movementX: 160, movementY: -80, timeStamp: 16 }),
    turned,
  );
  assert.equal(
    look.turn(turned, { movementX: -100, movementY: 0, timeStamp: 16 }).yaw,
    0.7,
  );
});

test("malformed mouse movement cannot poison the camera and the next valid motion still works", () => {
  const look = new MouseLook();
  const view = { yaw: 0, pitch: 0 };
  look.turn(view, { movementX: 0, movementY: 0, timeStamp: 16 });
  for (const invalid of [NaN, Infinity, -Infinity]) {
    assert.deepEqual(
      look.turn(view, { movementX: invalid, movementY: 10, timeStamp: 16 }),
      view,
    );
    assert.deepEqual(
      look.turn(view, { movementX: 10, movementY: invalid, timeStamp: 16 }),
      view,
    );
  }
  assert.deepEqual(
    look.turn(view, { movementX: 100, movementY: -50, timeStamp: 16 }),
    {
      yaw: 0.24,
      pitch: 0.12,
    },
  );
});

test("continuous fast turning remains responsive without smoothing or a frame budget", () => {
  const look = new MouseLook();
  let view = { yaw: 0, pitch: 0 };
  look.turn(view, { movementX: 0, movementY: 0, timeStamp: 16 });
  for (let i = 0; i < 10; i++)
    view = look.turn(view, { movementX: 250, movementY: 0, timeStamp: 16 });
  assert.ok(Math.abs(view.yaw - 6) < 1e-12);
  assert.equal(view.pitch, 0);
});

test("vertical look remains bounded and can immediately move away from either limit", () => {
  const look = new MouseLook();
  look.turn(
    { yaw: 0, pitch: 0 },
    { movementX: 0, movementY: 0, timeStamp: 16 },
  );
  assert.equal(
    look.turn(
      { yaw: 0, pitch: 1 },
      { movementX: 0, movementY: -100, timeStamp: 16 },
    ).pitch,
    1.1,
  );
  assert.equal(
    look.turn(
      { yaw: 0, pitch: -1 },
      { movementX: 0, movementY: 100, timeStamp: 16 },
    ).pitch,
    -1.1,
  );
  assert.equal(
    look.turn(
      { yaw: 0, pitch: 1.1 },
      { movementX: 0, movementY: 100, timeStamp: 16 },
    ).pitch,
    0.8600000000000001,
  );
});

test("sustained high-sensitivity motion is not mistaken for an isolated cursor warp", () => {
  const look = new MouseLook();
  let view = { yaw: 0, pitch: 0 };
  look.turn(view, { movementX: 0, movementY: 0, timeStamp: 0 });
  for (let i = 1; i <= 10; i++)
    view = look.turn(view, { movementX: 300, movementY: 0, timeStamp: i * 8 });
  assert.ok(Math.abs(view.yaw - 7.2) < 1e-12);
  assert.equal(view.pitch, 0);
});

test("opposite, delayed, or disproportionate large samples do not corroborate a warp", () => {
  for (const next of [
    { movementX: -300, movementY: 0, timeStamp: 24 },
    { movementX: 300, movementY: 0, timeStamp: 100 },
    { movementX: 1200, movementY: 0, timeStamp: 24 },
    { movementX: 0, movementY: 300, timeStamp: 24 },
  ]) {
    const look = new MouseLook();
    const view = { yaw: 0, pitch: 0 };
    look.turn(view, { movementX: 0, movementY: 0, timeStamp: 0 });
    look.turn(view, { movementX: 300, movementY: 0, timeStamp: 16 });
    assert.deepEqual(look.turn(view, next), view);
  }
});

test("normal motion and recapture discard a held spike rather than replaying it later", () => {
  const look = new MouseLook();
  const view = { yaw: 0, pitch: 0 };
  look.turn(view, { movementX: 0, movementY: 0, timeStamp: 0 });
  look.turn(view, { movementX: 300, movementY: 0, timeStamp: 8 });
  const turned = look.turn(view, {
    movementX: 100,
    movementY: 0,
    timeStamp: 16,
  });
  assert.equal(turned.yaw, 0.24);
  assert.deepEqual(
    look.turn(turned, { movementX: 300, movementY: 0, timeStamp: 24 }),
    turned,
  );
  look.reset();
  look.turn(turned, { movementX: 0, movementY: 0, timeStamp: 32 });
  assert.deepEqual(
    look.turn(turned, { movementX: 300, movementY: 0, timeStamp: 40 }),
    turned,
  );
});

test("native event accessors can corroborate sustained mouse movement", () => {
  class Movement {
    constructor(private readonly stamp: number) {}
    get movementX() {
      return 300;
    }
    get movementY() {
      return 0;
    }
    get timeStamp() {
      return this.stamp;
    }
  }
  const look = new MouseLook();
  const view = { yaw: 0, pitch: 0 };
  look.turn(view, new Movement(0));
  look.turn(view, new Movement(8));
  assert.equal(look.turn(view, new Movement(16)).yaw, 1.44);
});
