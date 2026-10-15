import { test } from "node:test";
import assert from "node:assert/strict";
import { initialInteraction, transition } from "../src/walk-session";
import { interactionKeyAction } from "../src/walk-input";
import type { Point } from "../src/puzzles";

const walking = () => transition(initialInteraction(), { type: "resume" });
const trace: Point[] = [
  [0, 2],
  [1, 2],
  [1, 1],
];
const tracing = () =>
  transition(transition(walking(), { type: "enter-panel", id: 1 }), {
    type: "trace",
    path: trace,
  });

test("E leaves a panel directly for active exploration, discarding only its unfinished trace", () => {
  const panel = tracing();
  assert.equal(interactionKeyAction(panel.mode, "KeyE", false), "leave-panel");
  const left = transition(panel, { type: "leave-panel" });
  assert.equal(left.mode, "walk");
  assert.equal(left.active, null);
  assert.deepEqual(left.path, []);
  assert.equal(transition(left, { type: "pause" }).returnMode, "walk");
});

test("successful completion returns directly to active exploration", () => {
  const completed = transition(tracing(), { type: "complete-panel" });
  assert.equal(completed.mode, "walk");
  assert.equal(completed.returnMode, "walk");
  assert.equal(completed.active, null);
  assert.deepEqual(completed.path, []);
});

test("Escape and focus loss preserve the exact panel and unfinished trace through Resume", () => {
  let panel = transition(tracing(), { type: "reject" });
  assert.equal(interactionKeyAction(panel.mode, "Escape", false), "pause");
  for (const type of ["pause", "focus-lost"] as const) {
    const paused = transition(panel, { type });
    assert.equal(paused.mode, "pause");
    assert.equal(paused.returnMode, "panel");
    assert.equal(paused.active, 1);
    assert.deepEqual(paused.path, trace);
    assert.equal(paused.error, true);
    const stillPaused = transition(paused, { type: "focus-lost" });
    const resumed = transition(stillPaused, { type: "resume" });
    assert.equal(resumed.mode, "panel");
    assert.equal(resumed.active, 1);
    assert.deepEqual(resumed.path, trace);
    assert.equal(resumed.error, true);
  }
});

test("Escape from exploration resumes exploration and capture denial never opens pause", () => {
  const paused = transition(walking(), { type: "pause" });
  assert.equal(paused.returnMode, "walk");
  const resumed = transition(paused, { type: "resume" });
  const requested = transition(resumed, { type: "capture-requested" });
  const denied = transition(requested, { type: "capture-denied" });
  assert.equal(denied.mode, "walk");
  assert.equal(denied.capture, "free");
  assert.equal(denied.active, null);
});

test("deliberate panel unlock and a delayed loss after exit cannot trigger pause", () => {
  const captured = transition(
    transition(walking(), { type: "capture-requested" }),
    { type: "capture-acquired" },
  );
  const panel = transition(captured, { type: "enter-panel", id: 0 });
  assert.equal(transition(panel, { type: "capture-lost" }).mode, "panel");
  const exited = transition(panel, { type: "leave-panel" });
  const requesting = transition(exited, { type: "capture-requested" });
  const lateLoss = transition(requesting, { type: "capture-lost" });
  assert.equal(lateLoss.mode, "walk");
  assert.equal(lateLoss.capture, "pending");
  assert.equal(
    transition(lateLoss, { type: "capture-acquired" }).capture,
    "locked",
  );
});

test("unexpected pointer-lock loss pauses exploration, while late acquisition cannot displace a panel", () => {
  const captured = transition(
    transition(walking(), { type: "capture-requested" }),
    { type: "capture-acquired" },
  );
  const lost = transition(captured, { type: "capture-lost" });
  assert.equal(lost.mode, "pause");
  assert.equal(lost.returnMode, "walk");
  assert.equal(transition(lost, { type: "resume" }).mode, "walk");
  const panel = tracing();
  const late = transition(panel, { type: "capture-acquired" });
  assert.equal(late.mode, "panel");
  assert.equal(late.expectedUnlock, true);
  assert.deepEqual(transition(late, { type: "capture-lost" }).path, trace);
});

test("events while paused cannot replace or complete the suspended puzzle", () => {
  const paused = transition(tracing(), { type: "pause" });
  assert.equal(transition(paused, { type: "complete-panel" }), paused);
  assert.equal(transition(paused, { type: "enter-panel", id: 2 }), paused);
  const unlocked = transition(paused, { type: "capture-lost" });
  const resumed = transition(unlocked, { type: "resume" });
  assert.equal(resumed.mode, "panel");
  assert.equal(resumed.active, 1);
  assert.deepEqual(resumed.path, trace);
  assert.equal(resumed.capture, "free");
  assert.equal(transition(resumed, { type: "capture-requested" }), resumed);
});
