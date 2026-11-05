/** Camera-space polygons, including the visible bounds of strokes and labels. */
export type Vec3 = [number, number, number];
export type PaintPolygon = {
  vertices: Vec3[];
  paint: (vertices: Vec3[]) => void;
};
type Plane = { normal: Vec3; offset: number };
const EPSILON = 1e-7;
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
function planeOf(vertices: Vec3[]): Plane | null {
  const a = vertices[0];
  for (let i = 1; i < vertices.length - 1; i++) {
    const b = vertices[i],
      c = vertices[i + 1];
    const u: Vec3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
    const v: Vec3 = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
    const normal: Vec3 = [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0],
    ];
    const length = Math.hypot(...normal);
    if (length < EPSILON) continue;
    for (let j = 0; j < 3; j++) normal[j] /= length;
    return { normal, offset: dot(normal, a) };
  }
  return null;
}
const distance = (plane: Plane, point: Vec3) =>
  dot(plane.normal, point) - plane.offset;
function sideOf(plane: Plane, vertices: Vec3[]): number {
  let side = 0;
  for (const point of vertices) {
    const d = distance(plane, point);
    if (d > EPSILON) side |= 1;
    if (d < -EPSILON) side |= 2;
  }
  return side;
}
/** A BSP splits crossing surfaces, unlike a centroid painter sort. The camera
 * is the origin, so each partition has an unambiguous far-to-near traversal. */
export function paintBackToFront(polygons: PaintPolygon[]): void {
  if (!polygons.length) return;
  let splitter: Plane | null = null,
    best = Infinity;
  // A small, evenly spaced sample avoids long trees without sorting by a
  // viewpoint-dependent scalar. The score prefers few splits and balance.
  const samples = Math.min(12, polygons.length);
  for (let i = 0; i < samples; i++) {
    const plane = planeOf(
      polygons[Math.floor((i * polygons.length) / samples)].vertices,
    );
    if (!plane) continue;
    let front = 0,
      back = 0,
      split = 0;
    for (const polygon of polygons) {
      const side = sideOf(plane, polygon.vertices);
      if (side === 1) front++;
      if (side === 2) back++;
      if (side === 3) split++;
    }
    const score = split * 8 + Math.abs(front - back);
    if (score < best) {
      best = score;
      splitter = plane;
    }
  }
  if (!splitter) return;
  const front: PaintPolygon[] = [],
    back: PaintPolygon[] = [],
    coplanar: PaintPolygon[] = [];
  for (const polygon of polygons) {
    const side = sideOf(splitter, polygon.vertices);
    if (!side) {
      coplanar.push(polygon);
      continue;
    }
    if (side !== 3) {
      (side === 1 ? front : back).push(polygon);
      continue;
    }
    const f: Vec3[] = [],
      b: Vec3[] = [];
    const vertices = polygon.vertices;
    for (let i = 0; i < vertices.length; i++) {
      const a = vertices[i],
        next = vertices[(i + 1) % vertices.length];
      const da = distance(splitter, a),
        db = distance(splitter, next);
      if (da >= -EPSILON) f.push(a);
      if (da <= EPSILON) b.push(a);
      if ((da > EPSILON && db < -EPSILON) || (da < -EPSILON && db > EPSILON)) {
        const t = da / (da - db);
        const point: Vec3 = [
          a[0] + (next[0] - a[0]) * t,
          a[1] + (next[1] - a[1]) * t,
          a[2] + (next[2] - a[2]) * t,
        ];
        f.push(point);
        b.push(point);
      }
    }
    if (f.length >= 3) front.push({ ...polygon, vertices: f });
    if (b.length >= 3) back.push({ ...polygon, vertices: b });
  }
  const cameraInFront = -splitter.offset >= 0;
  paintBackToFront(cameraInFront ? back : front);
  for (const polygon of coplanar) polygon.paint(polygon.vertices);
  paintBackToFront(cameraInFront ? front : back);
}
