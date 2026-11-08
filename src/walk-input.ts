export type WalkMode = "pause" | "walk" | "panel";
export type InteractionAction = "enter-panel" | "leave-panel" | "pause" | null;

/** One key press changes interaction mode once; auto-repeat cannot toggle it back. */
export function interactionKeyAction(
  mode: WalkMode,
  code: string,
  repeat: boolean,
): InteractionAction {
  if (code === "Escape") return mode === "pause" ? null : "pause";
  if (code === "KeyE" && !repeat)
    return mode === "panel"
      ? "leave-panel"
      : mode === "walk"
        ? "enter-panel"
        : null;
  return null;
}

type LookDirection = { yaw: number; pitch: number };
type MouseMovement = {
  movementX: number;
  movementY: number;
  timeStamp: number;
};

/** Relative mouse input, with capture warps and isolated outliers removed. */
export class MouseLook {
  private primed = false;
  private large: (MouseMovement & { accepted: boolean }) | null = null;

  reset() {
    this.primed = false;
    this.large = null;
  }

  turn(view: LookDirection, movement: MouseMovement): LookDirection {
    // Pointer capture can include a cursor recenter in the first event.
    if (!this.primed) {
      this.primed = true;
      return view;
    }
    let { movementX: x, movementY: y, timeStamp } = movement;
    if (![x, y, timeStamp].every(Number.isFinite)) {
      this.large = null;
      return view;
    }
    // Over 35 degrees in one event is suspicious, but a fast mouse can really
    // produce it. Hold only the first large sample until the next confirms a
    // sustained turn. Normal input never waits and discards an isolated warp.
    if (Math.max(Math.abs(x), Math.abs(y)) > 256) {
      const previous = this.large;
      const length = Math.hypot(x, y);
      const previousLength = previous
        ? Math.hypot(previous.movementX, previous.movementY)
        : 0;
      const continuous =
        previous !== null &&
        timeStamp > previous.timeStamp &&
        timeStamp - previous.timeStamp <= 50 &&
        length >= previousLength * 0.5 &&
        length <= previousLength * 2 &&
        (x * previous.movementX + y * previous.movementY) /
          (length * previousLength) >
          0.9;
      this.large = {
        movementX: x,
        movementY: y,
        timeStamp,
        accepted: continuous,
      };
      if (!continuous) return view;
      if (!previous!.accepted) {
        x += previous!.movementX;
        y += previous!.movementY;
      }
    } else {
      this.large = null;
    }
    return {
      yaw: view.yaw + x * 0.0024,
      pitch: Math.max(-1.1, Math.min(1.1, view.pitch - y * 0.0024)),
    };
  }
}
