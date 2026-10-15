import { puzzles, type Point } from "./puzzles";
import { validate } from "./domain";

export type Position = { x: number; z: number };
export type Camera = Position & { y: number; yaw: number; pitch: number };
export type Box = { x: number; z: number; width: number; depth: number };
export const panels = puzzles.slice(0, 3).map((puzzle, i) => ({
  puzzle,
  x: i === 1 ? 2.65 : -2.65,
  z: 3 - i * 10,
  gateZ: -i * 10,
}));
export const trees = [
  { x: -5.6, z: 6, height: 4.3 },
  { x: 5.7, z: 3.3, height: 4.8 },
  { x: -5.4, z: -5.1, height: 5.1 },
  { x: 5.6, z: -6, height: 4.2 },
  { x: -5.5, z: -14, height: 4.6 },
  { x: 5.6, z: -16.8, height: 5.2 },
  { x: -4.9, z: -25, height: 4 },
  { x: 5.2, z: -26.5, height: 4.9 },
];
export type WalkSave = {
  version: 1;
  solved: Record<number, Point[]>;
  arrived: boolean;
};
export const WALK_STORAGE = "stillwater.walk.v1";
export const freshWalk = (): WalkSave => ({
  version: 1,
  solved: {},
  arrived: false,
});
export function solvePanel(
  save: WalkSave,
  id: number,
  path: Point[],
): WalkSave {
  const panel = panels[id];
  if (
    !panel ||
    (id > 0 && !save.solved[id - 1]) ||
    validate(panel.puzzle, path)
  )
    return save;
  return {
    ...save,
    solved: { ...save.solved, [id]: path.map((p) => [...p] as Point) },
  };
}
export function restoreWalk(raw: string | null): WalkSave {
  let save = freshWalk();
  try {
    const data = JSON.parse(raw || "null");
    if (data?.version !== 1) return save;
    for (const { puzzle } of panels) {
      const route = data.solved?.[puzzle.id];
      if (Array.isArray(route)) save = solvePanel(save, puzzle.id, route);
    }
    save.arrived =
      data.arrived === true && panels.every((p) => save.solved[p.puzzle.id]);
  } catch {
    /* A malformed save cannot unlock a gate. */
  }
  return save;
}
export function arrive(save: WalkSave, position: Position): WalkSave {
  return position.z < -24 && panels.every((p) => save.solved[p.puzzle.id])
    ? { ...save, arrived: true }
    : save;
}
export function colliders(save: WalkSave): Box[] {
  const boxes: Box[] = [
    { x: -7.5, z: -10, width: 1, depth: 44 },
    { x: 7.5, z: -10, width: 1, depth: 44 },
    { x: 0, z: 10, width: 16, depth: 1 },
    { x: 0, z: -30, width: 16, depth: 1 },
    ...trees.map((t) => ({ ...t, width: 0.65, depth: 0.65 })),
    ...panels.map((p) => ({ x: p.x, z: p.z, width: 2.15, depth: 0.65 })),
    { x: 0, z: -27.5, width: 1.7, depth: 1.7 },
  ];
  for (const p of panels) {
    boxes.push(
      { x: -4.4, z: p.gateZ, width: 5.2, depth: 0.65 },
      { x: 4.4, z: p.gateZ, width: 5.2, depth: 0.65 },
    );
    if (!save.solved[p.puzzle.id])
      boxes.push({ x: 0, z: p.gateZ, width: 3.6, depth: 0.5 });
  }
  return boxes;
}
export function movePlayer(
  position: Position,
  dx: number,
  dz: number,
  solids: Box[],
): Position {
  const p = { ...position };
  const steps = Math.max(1, Math.ceil(Math.hypot(dx, dz) / 0.12));
  const blocked = (x: number, z: number) =>
    solids.some(
      (b) =>
        Math.abs(x - b.x) < b.width / 2 + 0.28 &&
        Math.abs(z - b.z) < b.depth / 2 + 0.28,
    );
  for (let n = 0; n < steps; n++) {
    if (!blocked(p.x + dx / steps, p.z)) p.x += dx / steps;
    if (!blocked(p.x, p.z + dz / steps)) p.z += dz / steps;
  }
  return p;
}
