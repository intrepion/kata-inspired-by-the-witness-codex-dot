import { test } from "node:test";
import assert from "node:assert/strict";
import { interactionKeyAction } from "../src/walk-input";

test("E enters a panel, requires release before exiting, and cannot reopen it while held", () => {
  assert.equal(interactionKeyAction("walk", "KeyE", false), "enter-panel");
  assert.equal(interactionKeyAction("panel", "KeyE", true), null);
  assert.equal(interactionKeyAction("panel", "KeyE", false), "leave-panel");
  assert.equal(interactionKeyAction("pause", "KeyE", true), null);
  assert.equal(interactionKeyAction("walk", "KeyE", true), null);
  assert.equal(interactionKeyAction("walk", "KeyE", false), "enter-panel");
});

test("E exits while Escape pauses, without changing other shortcuts", () => {
  assert.equal(interactionKeyAction("panel", "KeyE", false), "leave-panel");
  assert.equal(interactionKeyAction("panel", "Escape", false), "pause");
  assert.equal(interactionKeyAction("walk", "Escape", false), "pause");
  assert.equal(interactionKeyAction("pause", "KeyE", false), null);
  assert.equal(interactionKeyAction("panel", "KeyR", false), null);
});
