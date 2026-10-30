import { panels, trees, type Camera, type WalkSave } from "./walk-domain";
import { same } from "./domain";
import type { Point } from "./puzzles";
type Vec = [number, number, number];
type Screen = { x: number; y: number; depth: number };
type Command = { depth: number; paint: () => void };
export type ViewState = {
  save: WalkSave;
  active: number | null;
  path: Point[];
  error: boolean;
  gate: number[];
  time: number;
};

/** Pick the nearest visible panel when projected quads overlap on screen. */
export function nearestPanelHit(
  candidates: { id: number; corners: Screen[] }[],
  x: number,
  y: number,
): number | null {
  let nearest: number | null = null,
    nearestDepth = Infinity;
  for (const { id, corners } of candidates) {
    if (!corners.every((c) => c.depth > 0.08)) continue;
    const sides = corners.map((a, i) => {
      const b = corners[(i + 1) % corners.length];
      return (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);
    });
    if (!sides.every((v) => v >= 0) && !sides.every((v) => v <= 0)) continue;
    const depth = corners.reduce((sum, c) => sum + c.depth, 0) / corners.length;
    if (depth < nearestDepth) {
      nearest = id;
      nearestDepth = depth;
    }
  }
  return nearest;
}

/** A small perspective renderer. All panels, paths and scenery share the same world camera. */
export class GardenRenderer {
  private ctx: CanvasRenderingContext2D;
  private width = 1;
  private height = 1;
  private focal = 1;
  private camera: Camera = { x: 0, y: 1.65, z: 8, yaw: 0, pitch: 0 };
  private commands: Command[] = [];
  private visiblePanels: Set<number> | null = null;
  constructor(private canvas: HTMLCanvasElement) {
    this.ctx = canvas.getContext("2d")!;
  }
  private cameraPoint([x, y, z]: Vec): Vec {
    const c = this.camera,
      dx = x - c.x,
      dy = y - c.y,
      dz = z - c.z;
    const depth = dx * Math.sin(c.yaw) - dz * Math.cos(c.yaw);
    return [
      dx * Math.cos(c.yaw) + dz * Math.sin(c.yaw),
      dy * Math.cos(c.pitch) - depth * Math.sin(c.pitch),
      dy * Math.sin(c.pitch) + depth * Math.cos(c.pitch),
    ];
  }
  project(v: Vec): Screen {
    const [x, y, depth] = this.cameraPoint(v);
    return {
      x: this.width / 2 + (x * this.focal) / depth,
      y: this.height / 2 - (y * this.focal) / depth,
      depth,
    };
  }
  gridPoint(id: number, p: Point): Screen {
    const panel = panels[id],
      size = panel.puzzle.size;
    return this.project([
      panel.x - 0.78 + (p[0] * 1.56) / size,
      2.43 - (p[1] * 1.56) / size,
      panel.z + 0.19,
    ]);
  }
  panelAt(x: number, y: number): number | null {
    const candidates = panels
      .filter(
        (p) =>
          (!this.visiblePanels || this.visiblePanels.has(p.puzzle.id)) &&
          this.camera.z >= p.z + 0.35 &&
          Math.hypot(this.camera.x - p.x, this.camera.z - p.z) <= 4.6,
      )
      .map((p) => ({
        id: p.puzzle.id,
        corners: [
          this.project([p.x - 1.05, 2.925, p.z + 0.2]),
          this.project([p.x + 1.05, 2.925, p.z + 0.2]),
          this.project([p.x + 1.05, 0.375, p.z + 0.2]),
          this.project([p.x - 1.05, 0.375, p.z + 0.2]),
        ],
      }));
    return nearestPanelHit(candidates, x, y);
  }
  nearestVertex(id: number, x: number, y: number): Point | null {
    let best: Point | null = null,
      distance = Infinity;
    const size = panels[id].puzzle.size;
    const a = this.gridPoint(id, [0, 0]),
      b = this.gridPoint(id, [1, 0]);
    const radius = Math.max(15, Math.hypot(a.x - b.x, a.y - b.y) * 0.42);
    for (let gy = 0; gy <= size; gy++)
      for (let gx = 0; gx <= size; gx++) {
        const p = this.gridPoint(id, [gx, gy]),
          d = Math.hypot(p.x - x, p.y - y);
        if (d < radius && d < distance) {
          distance = d;
          best = [gx, gy];
        }
      }
    return best;
  }
  private face(vertices: Vec[], color: string) {
    const input = vertices.map((v) => this.cameraPoint(v));
    const clipped: Vec[] = [];
    for (let i = 0; i < input.length; i++) {
      const a = input[i],
        b = input[(i + 1) % input.length],
        near = 0.08;
      if (a[2] >= near) clipped.push(a);
      if (a[2] >= near !== b[2] >= near) {
        const t = (near - a[2]) / (b[2] - a[2]);
        clipped.push([
          a[0] + (b[0] - a[0]) * t,
          a[1] + (b[1] - a[1]) * t,
          near,
        ]);
      }
    }
    if (clipped.length < 3) return;
    const depth = clipped.reduce((s, v) => s + v[2], 0) / clipped.length;
    this.commands.push({
      depth,
      paint: () => {
        const ctx = this.ctx;
        ctx.beginPath();
        clipped.forEach(([x, y, z], i) =>
          ctx[i ? "lineTo" : "moveTo"](
            this.width / 2 + (x * this.focal) / z,
            this.height / 2 - (y * this.focal) / z,
          ),
        );
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      },
    });
  }
  private box(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    d: number,
    colors: string[],
  ) {
    const a = x - w / 2,
      b = x + w / 2,
      lo = y - h / 2,
      hi = y + h / 2,
      f = z + d / 2,
      back = z - d / 2;
    this.face(
      [
        [a, lo, f],
        [b, lo, f],
        [b, hi, f],
        [a, hi, f],
      ],
      colors[0],
    );
    this.face(
      [
        [b, lo, f],
        [b, lo, back],
        [b, hi, back],
        [b, hi, f],
      ],
      colors[1] || colors[0],
    );
    this.face(
      [
        [a, lo, back],
        [a, lo, f],
        [a, hi, f],
        [a, hi, back],
      ],
      colors[1] || colors[0],
    );
    this.face(
      [
        [b, lo, back],
        [a, lo, back],
        [a, hi, back],
        [b, hi, back],
      ],
      colors[1] || colors[0],
    );
    this.face(
      [
        [a, hi, f],
        [b, hi, f],
        [b, hi, back],
        [a, hi, back],
      ],
      colors[2] || colors[0],
    );
  }
  private line(a: Vec, b: Vec, color: string, width: number) {
    const pa = this.project(a),
      pb = this.project(b);
    if (pa.depth < 0.08 || pb.depth < 0.08) return;
    this.commands.push({
      depth: (pa.depth + pb.depth) / 2 - 0.002,
      paint: () => {
        const c = this.ctx;
        c.beginPath();
        c.moveTo(pa.x, pa.y);
        c.lineTo(pb.x, pb.y);
        c.strokeStyle = color;
        c.lineWidth = Math.max(
          1,
          (width * this.focal) / ((pa.depth + pb.depth) / 2),
        );
        c.lineCap = "round";
        c.stroke();
      },
    });
  }
  private disk(x: number, y: number, z: number, r: number, color: string) {
    this.face(
      Array.from(
        { length: 20 },
        (_, i) =>
          [
            x + Math.cos((i * Math.PI) / 10) * r,
            y + Math.sin((i * Math.PI) / 10) * r,
            z,
          ] as Vec,
      ),
      color,
    );
  }
  private text(at: Vec, value: string, size: number, color: string) {
    const p = this.project(at);
    if (p.depth < 0.2) return;
    this.commands.push({
      depth: p.depth - 0.004,
      paint: () => {
        const c = this.ctx;
        c.fillStyle = color;
        c.font = `500 ${Math.max(5, (size * this.focal) / p.depth)}px system-ui`;
        c.textAlign = "center";
        c.fillText(value, p.x, p.y);
      },
    });
  }
  render(camera: Camera, state: ViewState, visiblePanels: Set<number> | null = null) {
    const rect = this.canvas.getBoundingClientRect(),
      ratio = Math.min(devicePixelRatio || 1, 1.5);
    this.width = rect.width;
    this.height = rect.height;
    this.focal = Math.min(this.height * 0.86, this.width * 0.9);
    if (
      this.canvas.width !== Math.round(this.width * ratio) ||
      this.canvas.height !== Math.round(this.height * ratio)
    ) {
      this.canvas.width = Math.round(this.width * ratio);
      this.canvas.height = Math.round(this.height * ratio);
    }
    const c = this.ctx;
    c.setTransform(ratio, 0, 0, ratio, 0, 0);
    this.camera = camera;
    this.commands = [];
    this.visiblePanels = visiblePanels;
    if (visiblePanels) {
      c.clearRect(0, 0, this.width, this.height);
      for (const p of panels) if (visiblePanels.has(p.puzzle.id)) this.drawPanel(p.puzzle.id, state);
      this.commands.sort((a, b) => b.depth - a.depth).forEach((cmd) => cmd.paint());
      return;
    }
    const sky = c.createLinearGradient(0, 0, 0, this.height);
    sky.addColorStop(0, "#7eaeaf");
    sky.addColorStop(0.58, "#deead7");
    sky.addColorStop(1, "#72a3a1");
    c.fillStyle = sky;
    c.fillRect(0, 0, this.width, this.height);
    const flush = () => {
      this.commands
        .sort((a, b) => b.depth - a.depth)
        .forEach((cmd) => cmd.paint());
      this.commands = [];
    };
    this.disk(-45, 38, -130, 7, "#fff0bd");
    flush();
    // Sea, distant islands and the garden's raised stone shore.
    this.face(
      [
        [-500, -0.9, 500],
        [500, -0.9, 500],
        [500, -0.9, -500],
        [-500, -0.9, -500],
      ],
      "#77a7a6",
    );
    flush();
    for (let i = 0; i < 7; i++) {
      const x = -85 + i * 28,
        z = -100 - (i % 3) * 15;
      this.face(
        [
          [x - 23, -0.8, z],
          [x + 22, -0.8, z],
          [x + 6, 7 + (i % 3) * 3, z],
        ],
        i % 2 ? "#92b3ab" : "#aac3b6",
      );
    }
    flush();
    this.box(0, -0.55, -10, 15, 1, 42, ["#b6b59b", "#929f91", "#a9b59c"]);
    this.face(
      [
        [-7, 0, 10],
        [7, 0, 10],
        [7, 0, -30],
        [-7, 0, -30],
      ],
      "#94a47c",
    );
    flush();
    for (let z = 9; z > -29; z -= 1.7)
      this.box(0, 0.02, z, 2.6, 0.035, 1.55, ["#d5d2b3", "#b5bba0", "#d9d5b7"]);
    for (const p of panels) {
      this.box(p.x / 2, 0.024, p.z + 1.3, Math.abs(p.x) + 2.5, 0.04, 1.3, [
        "#d5d2b3",
      ]);
      const on = !!state.save.solved[p.puzzle.id],
        wire = on ? "#f0d28c" : "#596d60";
      this.line([p.x, 0.07, p.z], [p.x, 0.07, p.gateZ + 0.7], wire, 0.055);
      this.line(
        [p.x, 0.07, p.gateZ + 0.7],
        [1.65, 0.07, p.gateZ + 0.7],
        wire,
        0.055,
      );
      this.line(
        [1.65, 0.07, p.gateZ + 0.7],
        [1.65, 1.5, p.gateZ + 0.15],
        wire,
        0.055,
      );
      for (const x of [-4.4, 4.4])
        this.box(x, 0.59, p.gateZ, 5.2, 1.18, 0.65, [
          "#b5baa3",
          "#99a68e",
          "#d0ceb1",
        ]);
      for (const x of [-1.8, 1.8]) {
        this.box(x, 1.4, p.gateZ, 0.35, 2.8, 0.55, [
          "#65796a",
          "#4e685d",
          "#96a58a",
        ]);
        this.disk(x, 2.55, p.gateZ + 0.29, 0.08, on ? "#f3d996" : "#bac5a6");
      }
      const gateY = 1.2 + state.gate[p.puzzle.id] * 2.8;
      for (let x = -1.5; x <= 1.51; x += 0.375)
        this.box(x, gateY, p.gateZ, 0.11, 2.3, 0.16, [
          "#517466",
          "#3d5c53",
          "#9eac8b",
        ]);
      this.box(0, gateY - 0.7, p.gateZ, 3.35, 0.16, 0.19, ["#6b8b72"]);
      this.box(0, gateY + 0.7, p.gateZ, 3.35, 0.16, 0.19, ["#6b8b72"]);
      this.text(
        [0, 2.96, p.gateZ + 0.31],
        ["THE LANDING", "THE ORCHARD", "THE TERRACES"][p.puzzle.id],
        0.11,
        "#344f47",
      );
      this.drawPanel(p.puzzle.id, state);
    }
    // Shore rails prevent the flat terrain from reading as an unbounded plane.
    for (const x of [-7, 7])
      for (let z = 9; z > -30; z -= 3) {
        this.box(x, 0.42, z, 0.18, 0.84, 0.18, ["#c3c7ac"]);
        this.box(x, 0.62, z - 1.4, 0.1, 0.12, 2.9, ["#aeb99b"]);
      }
    for (const t of trees) {
      this.box(t.x, (t.height - 1.1) / 2, t.z, 0.42, t.height - 1.1, 0.42, [
        "#827c61",
        "#676c54",
        "#999679",
      ]);
      for (let tier = 0; tier < 3; tier++) {
        const y = t.height - 1.7 + tier * 0.65,
          r = 1.65 - tier * 0.28;
        for (let i = 0; i < 7; i++) {
          const a = (i * Math.PI * 2) / 7,
            b = ((i + 1) * Math.PI * 2) / 7;
          this.face(
            [
              [t.x + Math.cos(a) * r, y, t.z + Math.sin(a) * r],
              [t.x + Math.cos(b) * r, y, t.z + Math.sin(b) * r],
              [t.x + 0.15, y + 1.45, t.z],
            ],
            [
              "#638b6b",
              "#779773",
              "#8da57a",
              "#72946d",
              "#567c63",
              "#91a97c",
              "#7e9c72",
            ][i],
          );
        }
      }
    }
    // Reeds, low beds and original garden stones.
    for (let i = 0; i < 28; i++) {
      const x = (i % 2 ? 1 : -1) * (4.3 + Math.sin(i * 13) * 0.6),
        z = 7 - i * 1.23;
      this.box(x, 0.13, z, 0.38, 0.26, 0.5, ["#b0b99a", "#8e9f81", "#c3c8a6"]);
      this.line(
        [x + 0.4, 0, z],
        [x + 0.45, 0.65 + 0.2 * Math.sin(i), z],
        "#6e8b63",
        0.025,
      );
    }
    this.box(0, 0.25, -27.5, 1.6, 0.5, 1.6, ["#b9bda4", "#93a38f", "#d2cfb1"]);
    for (const x of [-0.48, 0.48])
      this.box(x, 1.45, -27.5, 0.12, 2.2, 0.12, ["#435f54"]);
    this.box(0, 2.64, -27.5, 1.45, 0.18, 1.15, [
      "#456858",
      "#38574d",
      "#789078",
    ]);
    this.box(0, 1.78, -27.5, 0.65, 0.9, 0.65, [
      state.save.arrived ? "#ffe5a2" : "#d9c99c",
      "#c4c29a",
      "#fff0ba",
    ]);
    this.text([0, 0.69, -26.66], "THE LIGHT YOU LEAVE BEHIND", 0.09, "#36564d");
    this.commands
      .sort((a, b) => b.depth - a.depth)
      .forEach((cmd) => cmd.paint());
  }
  private drawPanel(id: number, state: ViewState) {
    const commandStart = this.commands.length;
    const p = panels[id],
      puzzle = p.puzzle,
      active = state.active === id;
    const route = active ? state.path : state.save.solved[id] || [];
    const color =
      active && state.error
        ? `hsl(14 70% ${matchMedia("(prefers-reduced-motion: reduce)").matches ? 65 : 65 + Math.sin(state.time * 5) * 7}%)`
        : state.save.solved[id]
          ? "#ffe3a0"
          : "#ebd9a5";
    this.box(p.x, 0.4, p.z, 1, 0.8, 0.6, ["#88967e", "#6d806d", "#aab297"]);
    this.box(p.x, 1.65, p.z, 2.1, 2.55, 0.32, [
      "#3d5d53",
      "#304e48",
      "#79917a",
    ]);
    this.face(
      [
        [p.x - 0.94, 0.65, p.z + 0.17],
        [p.x + 0.94, 0.65, p.z + 0.17],
        [p.x + 0.94, 2.65, p.z + 0.17],
        [p.x - 0.94, 2.65, p.z + 0.17],
      ],
      "#223e39",
    );
    const structure = this.commands.splice(commandStart);
    const world = (q: Point): Vec => [
      p.x - 0.78 + (q[0] * 1.56) / puzzle.size,
      2.43 - (q[1] * 1.56) / puzzle.size,
      p.z + 0.19,
    ];
    for (let n = 0; n <= puzzle.size; n++) {
      this.line(world([n, 0]), world([n, puzzle.size]), "#738a70", 0.04);
      this.line(world([0, n]), world([puzzle.size, n]), "#738a70", 0.04);
    }
    for (const q of puzzle.waypoints) {
      const [x, y, z] = world(q),
        touched = route.some((r) => same(r, q));
      this.disk(
        x,
        y,
        z + 0.012,
        0.085,
        active && state.error && !touched ? "#ee8b6b" : "#dcc58a",
      );
      this.disk(x, y, z + 0.016, 0.036, touched ? "#fff2c4" : "#27483e");
    }
    for (let n = 1; n < route.length; n++) {
      const a = world(route[n - 1]),
        b = world(route[n]);
      a[2] += 0.03;
      b[2] += 0.03;
      this.line(a, b, color, 0.073);
    }
    const [sx, sy, sz] = world(puzzle.start),
      [ex, ey, ez] = world(puzzle.end);
    this.disk(sx, sy, sz + 0.04, 0.115, route.length ? color : "#ddcd9a");
    this.line([ex, ey, ez + 0.04], [ex, ey + 0.13, ez + 0.04], color, 0.075);
    this.disk(ex, ey + 0.13, ez + 0.045, 0.04, color);
    this.text(
      [p.x, 2.76, p.z + 0.18],
      `0${id + 1}  /  ${puzzle.title.toUpperCase()}`,
      0.085,
      "#d6d9b9",
    );
    this.text(
      [p.x, 0.47, p.z + 0.18],
      state.save.solved[id] ? "CHANNEL RESTORED" : "STILLWATER • FIELD TABLET",
      0.062,
      "#c1c9a7",
    );
    // Composite coplanar markings after their tablet. Per-edge depth sorting
    // can otherwise bury a lower line inside the face at a pitched viewpoint.
    const markings = this.commands.splice(commandStart);
    this.commands.push({
      depth: this.project([p.x, 1.65, p.z]).depth,
      paint: () => {
        structure.sort((a, b) => b.depth - a.depth).forEach((c) => c.paint());
        if (this.camera.z > p.z + 0.19) markings.forEach((c) => c.paint());
      },
    });
  }
}
