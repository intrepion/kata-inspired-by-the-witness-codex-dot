import { test } from "node:test";
import { strict as assert } from "node:assert";
import { createCanvas } from "@napi-rs/canvas";
import { GardenRenderer, type ViewState } from "../src/walk-render";
import { freshWalk, type Camera } from "../src/walk-domain";

// Supply browser boundary values; all drawing uses a real Canvas implementation.
Object.defineProperty(globalThis, "devicePixelRatio", {
  value: 1,
  configurable: true,
});
Object.defineProperty(globalThis, "matchMedia", {
  value: () => ({ matches: true }),
  configurable: true,
});

function garden(
  camera: Camera,
  state: Partial<ViewState> = {},
  visiblePanels: Set<number> | null = null,
) {
  const canvas = createCanvas(1100, 640);
  Object.assign(canvas, {
    getBoundingClientRect: () => ({ width: 1100, height: 640 }),
  });
  const renderer = new GardenRenderer(canvas as unknown as HTMLCanvasElement);
  renderer.render(
    camera,
    {
      save: freshWalk(),
      active: null,
      path: [],
      error: false,
      gate: [0, 0, 0],
      time: 0,
      ...state,
    },
    visiblePanels,
  );
  const pixel = (x: number, y: number) =>
    [...canvas.getContext("2d").getImageData(x, y, 1, 1).data].slice(0, 3);
  return { canvas, renderer, pixel };
}

test("a channel remains visible when walking past its near endpoint and looking down", () => {
  const { pixel } = garden({ x: -2.65, y: 1.65, z: 2, yaw: 0, pitch: -0.4 });
  // The channel is on the ground ahead at x=-2.65. Its far end is visible
  // around y=607 and it continues toward the bottom edge, even though its
  // other end is behind the viewer. #596d60 is the unpowered channel color.
  assert.deepEqual(pixel(550, 625), [89, 109, 96]);
});

test("turning beside a wall never reveals its far face through its front", () => {
  for (const yaw of [1.5, 1.6, 1.7, 2]) {
    const { renderer, pixel } = garden({ x: -6, y: 1.65, z: 1, yaw, pitch: 0 });
    // The ray reaches the wall front at z=.325 first, below its top and
    // away from the sides. Turning must not change which surface is visible.
    const point = renderer.project([-4, 1, 0.325]);
    assert.deepEqual(
      pixel(Math.round(point.x), Math.round(point.y)),
      [181, 186, 163],
      `yaw=${yaw}`,
    );
  }
});

test("the back of a tablet hides the paving beyond it when walking around it", () => {
  for (const x of [0, 0.25, 0.5])
    for (const yaw of [-2.2, -2, -1.8, -1.6]) {
      const { pixel, renderer } = garden({
        x,
        y: 1.65,
        z: 1.5,
        yaw,
        pitch: -0.2,
      });
      // The ray hits tablet 0's back at (-1.9,.8,2.84), before the branch
      // paving begins at z=3.65, and cannot cross the base at x<=-2.15.
      const point = renderer.project([-1.9, 0.8, 2.84]);
      assert.deepEqual(
        pixel(Math.round(point.x), Math.round(point.y)),
        [48, 78, 72],
        `x=${x}, yaw=${yaw}`,
      );
    }
});

test("tablet grid strokes and picking stay aligned at pitched and turned viewpoints", () => {
  for (const pitch of [-0.2, 0, 0.2])
    for (const yaw of [-0.4, 0, 0.4]) {
      const { pixel, renderer } = garden({
        x: -2.65,
        y: 1.65,
        z: 6.3,
        yaw,
        pitch,
      });
      for (const world of [
        [-2.26, 2.43, 3.19],
        [-2.65, 2.04, 3.19],
        [-3.04, 0.87, 3.19],
      ] as [number, number, number][]) {
        const point = renderer.project(world);
        assert.deepEqual(
          pixel(Math.round(point.x), Math.round(point.y)),
          [115, 138, 112],
          `pitch=${pitch}, yaw=${yaw}`,
        );
      }
      const center = renderer.gridPoint(0, [1, 1]);
      assert.equal(renderer.panelAt(center.x, center.y), 0);
      assert.deepEqual(renderer.nearestVertex(0, center.x, center.y), [1, 1]);
    }
});

test("tree foliage keeps its outward facing facets when viewed from the path", () => {
  const { pixel, renderer } = garden({
    x: -5.6,
    y: 1.65,
    z: 9,
    yaw: 0,
    pitch: 0.5,
  });
  // Interior of the first tree's south-facing lower-tier facet. It must
  // cover the far side of the canopy, rather than expose inside-out faces.
  const point = renderer.project([-5.3295, 3.083333, 6.966]);
  assert.deepEqual(
    pixel(Math.round(point.x), Math.round(point.y)),
    [119, 151, 115],
  );
});

test("both halves of a tablet title remain readable when approaching at an angle", () => {
  const { canvas, renderer } = garden(
    { x: 0, y: 1.65, z: 5, yaw: -0.7, pitch: 0 },
    {},
    new Set([0]),
  );
  const center = renderer.project([-2.65, 2.76, 3.18]);
  const data = canvas.getContext("2d").getImageData(0, 0, 1100, 640).data;
  const count = [0, 0];
  for (let y = Math.floor(center.y - 20); y <= center.y; y++) {
    for (let x = Math.floor(center.x - 90); x <= center.x + 90; x++) {
      const i = (y * 1100 + x) * 4;
      if (data[i] === 214 && data[i + 1] === 217 && data[i + 2] === 185)
        count[Number(x >= center.x)]++;
    }
  }
  // Each half contains several complete letters. A title intersecting its
  // own supporting surface loses almost all pixels on one side.
  assert.ok(
    count.every((n) => n > 20),
    `opaque title pixels left/right: ${count}`,
  );
});
