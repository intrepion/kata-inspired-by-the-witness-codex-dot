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
