import type { Point } from "./puzzles";
import type { WalkMode } from "./walk-input";

export type InteractionState = {
  mode: WalkMode;
  returnMode: "walk" | "panel";
  active: number | null;
  path: Point[];
  error: boolean;
  capture: "free" | "pending" | "locked";
  expectedUnlock: boolean;
};
export type InteractionEvent =
  | { type: "enter-panel"; id: number }
  | { type: "trace"; path: Point[] }
  | { type: "reject" }
  | {
      type:
        | "pause"
        | "focus-lost"
        | "resume"
        | "leave-panel"
        | "complete-panel"
        | "capture-requested"
        | "capture-acquired"
        | "capture-lost"
        | "capture-denied"
        | "release-capture";
    };

export const initialInteraction = (): InteractionState => ({
  mode: "pause",
  returnMode: "walk",
  active: null,
  path: [],
  error: false,
  capture: "free",
  expectedUnlock: false,
});

/** Pause suspends a session; leaving/completing a tablet ends that session. */
export function transition(
  state: InteractionState,
  event: InteractionEvent,
): InteractionState {
  switch (event.type) {
    case "enter-panel":
      return state.mode === "walk"
        ? {
            ...state,
            mode: "panel",
            returnMode: "panel",
            active: event.id,
            path: [],
            error: false,
            capture: "free",
            expectedUnlock: state.expectedUnlock || state.capture !== "free",
          }
        : state;
    case "trace":
      return state.mode === "panel"
        ? { ...state, path: event.path, error: false }
        : state;
    case "reject":
      return state.mode === "panel" ? { ...state, error: true } : state;
    case "leave-panel":
    case "complete-panel":
      return state.mode === "panel"
        ? {
            ...state,
            mode: "walk",
            returnMode: "walk",
            active: null,
            path: [],
            error: false,
            capture: "free",
            expectedUnlock: state.expectedUnlock || state.capture !== "free",
          }
        : state;
    case "pause":
    case "focus-lost":
      return state.mode === "pause"
        ? state
        : {
            ...state,
            returnMode: state.mode,
            mode: "pause",
            capture: "free",
            expectedUnlock: state.expectedUnlock || state.capture !== "free",
          };
    case "resume":
      return state.mode === "pause"
        ? { ...state, mode: state.returnMode }
        : state;
    case "capture-requested":
      return state.mode === "walk" ? { ...state, capture: "pending" } : state;
    case "capture-acquired":
      return state.mode === "walk"
        ? { ...state, capture: "locked", expectedUnlock: false }
        : { ...state, capture: "free", expectedUnlock: true };
    case "release-capture":
      return { ...state, capture: "free", expectedUnlock: true };
    case "capture-denied":
      return state.capture === "pending"
        ? { ...state, capture: "free" }
        : state;
    case "capture-lost":
      if (
        state.expectedUnlock ||
        state.capture !== "locked" ||
        state.mode !== "walk"
      )
        return {
          ...state,
          capture: state.capture === "pending" ? "pending" : "free",
          expectedUnlock: false,
        };
      return {
        ...state,
        mode: "pause",
        returnMode: "walk",
        capture: "free",
        expectedUnlock: false,
      };
  }
}
