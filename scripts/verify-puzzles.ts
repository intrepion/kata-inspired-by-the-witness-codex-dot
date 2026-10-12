/** Exhaustive independent authoring audit. Deliberately never imports the game validator. */
import { writeFileSync, mkdirSync } from "node:fs";
import { puzzles, type Point, type Puzzle } from "../src/puzzles";
const key = (p: Point) => `${p[0]},${p[1]}`;
const edge = (a: Point, b: Point) => [key(a), key(b)].sort().join("|");
export function independentlyEnumerate(p: Puzzle): Point[][] {
  const results: Point[][] = [];
  function visit(path: Point[], seen: Set<string>) {
    const current = path[path.length - 1]!;
    if (key(current) === key(p.end)) {
      results.push(path);
      return;
    }
    for (const [dx, dy] of [
      [1, 0],
      [0, -1],
      [-1, 0],
      [0, 1],
    ]) {
      const next: Point = [current[0] + dx!, current[1] + dy!];
      if (next.some((v) => v < 0 || v > p.size) || seen.has(key(next)))
        continue;
      visit([...path, next], new Set([...seen, key(next)]));
    }
  }
  visit([p.start], new Set([key(p.start)]));
  return results;
}
export function independentlyAccepts(p: Puzzle, path: Point[]): boolean {
  if (
    path.length < 2 ||
    key(path[0]!) !== key(p.start) ||
    key(path.at(-1)!) !== key(p.end)
  )
    return false;
  const vertices = new Set<string>();
  const edges = new Set<string>();
  for (let i = 0; i < path.length; i++) {
    const v = path[i]!;
    if (
      v.some((n) => !Number.isInteger(n) || n < 0 || n > p.size) ||
      vertices.has(key(v))
    )
      return false;
    vertices.add(key(v));
    if (i) {
      const previous = path[i - 1]!;
      if (Math.abs(v[0] - previous[0]) + Math.abs(v[1] - previous[1]) !== 1)
        return false;
      edges.add(edge(previous, v));
    }
  }
  if (p.waypoints.some((v) => !vertices.has(key(v)))) return false;
  for (const {
    cell: [x, y],
    count,
  } of p.triangles) {
    const corners: Point[] = [
      [x, y],
      [x + 1, y],
      [x + 1, y + 1],
      [x, y + 1],
    ];
    const actual = corners.reduce(
      (sum, a, i) => sum + Number(edges.has(edge(a, corners[(i + 1) % 4]!))),
      0,
    );
    if (actual !== count) return false;
  }
  // Union-find independently models connectivity of cell interiors. Only shared
  // internal edges connect cells; perimeter edges never join an exterior region.
  const parents = Array.from({ length: p.size * p.size }, (_, i) => i);
  const index = (x: number, y: number) => y * p.size + x;
  function root(i: number): number {
    while (parents[i] !== i) i = parents[i]!;
    return i;
  }
  function join(a: number, b: number) {
    parents[root(a)] = root(b);
  }
  for (let y = 0; y < p.size; y++)
    for (let x = 0; x < p.size; x++) {
      if (x + 1 < p.size && !edges.has(edge([x + 1, y], [x + 1, y + 1])))
        join(index(x, y), index(x + 1, y));
      if (y + 1 < p.size && !edges.has(edge([x, y + 1], [x + 1, y + 1])))
        join(index(x, y), index(x, y + 1));
    }
  const kinds = new Map<number, string>();
  for (const {
    cell: [x, y],
    kind,
  } of p.symbols) {
    const group = root(index(x, y));
    if (kinds.has(group) && kinds.get(group) !== kind) return false;
    kinds.set(group, kind);
  }
  return true;
}
const expectedAccepted = [12, 10, 48, 5, 54, 12, 5, 4, 4, 8, 124, 4, 2, 1];
const evidence = puzzles.map((p) => {
  const all = independentlyEnumerate(p);
  const accepted = all.filter((path) => independentlyAccepts(p, path));
  if (accepted.length !== expectedAccepted[p.id])
    throw new Error(
      `${p.title}: accepted solution count changed to ${accepted.length}`,
    );
  if (!accepted.length) throw new Error(`${p.title} is unsolvable`);
  if (!independentlyAccepts(p, p.solution))
    throw new Error(`${p.title}: authored hint path rejected`);
  if (!all.some((path) => JSON.stringify(path) === JSON.stringify(p.solution)))
    throw new Error(`${p.title}: hint path not enumerated`);
  return {
    id: p.id,
    title: p.title,
    size: p.size,
    enumeratedPaths: all.length,
    acceptedPaths: accepted.length,
    unique: accepted.length === 1,
    exampleSolution: p.solution,
  };
});
mkdirSync("docs", { recursive: true });
writeFileSync(
  "docs/puzzle-enumeration.json",
  JSON.stringify(
    {
      method:
        "All simple orthogonal start-to-goal paths; independent union-find cell connectivity and exact edge counts. No production validator imported.",
      puzzles: evidence,
    },
    null,
    2,
  ) + "\n",
);
console.table(evidence.map(({ exampleSolution: _, ...rest }) => rest));
console.log(
  `Verified ${evidence.length} original puzzles; ${evidence.reduce((s, p) => s + p.enumeratedPaths, 0)} paths enumerated.`,
);
