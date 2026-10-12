import type { Point, Puzzle } from "./puzzles";
export const same = (a: Point, b: Point) => a[0] === b[0] && a[1] === b[1];
const key = (a: Point) => a.join(",");
export const edge = (a: Point, b: Point) => [key(a), key(b)].sort().join("|");
const inside = (p: Puzzle, a: Point) =>
  Array.isArray(a) &&
  a.length === 2 &&
  a.every((v) => Number.isInteger(v) && v >= 0 && v <= p.size);
export function validate(p: Puzzle, path: Point[]): string | null {
  if (
    !Array.isArray(path) ||
    path.length < 2 ||
    path.some((a) => !inside(p, a))
  )
    return "The trace must stay on the tablet.";
  if (!same(path[0], p.start) || !same(path.at(-1)!, p.end))
    return "Connect the round spring to the square lantern.";
  const seen = new Set<string>();
  const walls = new Set<string>();
  for (let i = 0; i < path.length; i++) {
    const a = path[i];
    if (seen.has(key(a))) return "A trace cannot cross itself.";
    seen.add(key(a));
    if (i) {
      const b = path[i - 1];
      if (Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]) !== 1)
        return "Follow neighboring points, one edge at a time.";
      walls.add(edge(a, b));
    }
  }
  if (p.waypoints.some((a) => !seen.has(key(a))))
    return "Something on the tablet is still waiting to be touched.";
  for (const t of p.triangles) {
    const [x, y] = t.cell;
    const corners: Point[] = [
      [x, y],
      [x + 1, y],
      [x + 1, y + 1],
      [x, y + 1],
    ];
    const count = corners.filter((a, i) =>
      walls.has(edge(a, corners[(i + 1) % 4])),
    ).length;
    if (count !== t.count) return "A notch has not found its balance.";
  }
  const visited = new Set<string>();
  for (let y = 0; y < p.size; y++)
    for (let x = 0; x < p.size; x++) {
      if (visited.has(key([x, y]))) continue;
      const stack: Point[] = [[x, y]],
        kinds = new Set<string>();
      visited.add(key([x, y]));
      while (stack.length) {
        const [cx, cy] = stack.pop()!;
        p.symbols
          .filter((s) => same(s.cell, [cx, cy]))
          .forEach((s) => kinds.add(s.kind));
        const neighbors: { cell: Point; a: Point; b: Point }[] = [
          { cell: [cx - 1, cy], a: [cx, cy], b: [cx, cy + 1] },
          { cell: [cx + 1, cy], a: [cx + 1, cy], b: [cx + 1, cy + 1] },
          { cell: [cx, cy - 1], a: [cx, cy], b: [cx + 1, cy] },
          { cell: [cx, cy + 1], a: [cx, cy + 1], b: [cx + 1, cy + 1] },
        ];
        for (const n of neighbors) {
          if (
            n.cell.some((v) => v < 0 || v >= p.size) ||
            visited.has(key(n.cell)) ||
            walls.has(edge(n.a, n.b))
          )
            continue;
          visited.add(key(n.cell));
          stack.push(n.cell);
        }
      }
      if (kinds.size > 1)
        return "Two different inhabitants still share a room.";
    }
  return null;
}
export function extend(p: Puzzle, path: Point[], a: Point): Point[] {
  if (!inside(p, a)) return path;
  if (!path.length) return same(a, p.start) ? [a] : path;
  if (path.length > 1 && same(a, path[path.length - 2]))
    return path.slice(0, -1);
  const last = path.at(-1)!;
  if (
    same(last, p.end) ||
    path.some((b) => same(a, b)) ||
    Math.abs(a[0] - last[0]) + Math.abs(a[1] - last[1]) !== 1
  )
    return path;
  return [...path, a];
}
export function nextHint(
  p: Puzzle,
  level: number,
): { level: number; text: string } {
  const n = Math.min(Math.max(0, Math.floor(level) || 0) + 1, p.hints.length);
  return { level: n, text: p.hints[n - 1] };
}
