import { GardenRenderer } from "../src/walk-render";
import { freshWalk, type Camera } from "../src/walk-domain";
const canvas = document.querySelector("canvas")!;
const renderer = new GardenRenderer(canvas);
const views: Record<string, Camera> = {
  "Starting view": { x: 0, y: 1.65, z: 8, yaw: 0, pitch: 0 },
  "Wall before turning": { x: -6, y: 1.65, z: 1, yaw: 1.5, pitch: 0 },
  "Wall after turning": { x: -6, y: 1.65, z: 1, yaw: 1.6, pitch: 0 },
  "Behind the tablet": { x: 0, y: 1.65, z: 1.5, yaw: -2, pitch: -0.2 },
  "Channel crossing the camera": {
    x: -2.65,
    y: 1.65,
    z: 2,
    yaw: 0,
    pitch: -0.4,
  },
};
for (const [label, camera] of Object.entries(views)) {
  const button = document.createElement("button");
  button.textContent = label;
  button.onclick = () => {
    renderer.render(camera, {
      save: freshWalk(),
      active: null,
      path: [],
      error: false,
      gate: [0, 0, 0],
      time: 0,
    });
    document.querySelector("#result")!.textContent =
      label + "\n" + JSON.stringify(camera);
  };
  document.querySelector("#views")!.append(button);
}
(document.querySelector("button") as HTMLButtonElement).click();
