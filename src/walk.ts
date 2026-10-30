import "./walk.css";
import { interactionKeyAction } from "./walk-input";
import {
  initialInteraction,
  transition,
  type InteractionEvent,
} from "./walk-session";
import { extend, same, validate } from "./domain";
import { type Point } from "./puzzles";
import {
  panels,
  WALK_STORAGE,
  restoreWalk,
  solvePanel,
  colliders,
  movePlayer,
  arrive,
  type Camera,
} from "./walk-domain";
import { GardenRenderer } from "./walk-render";
import type { createGardenThree } from "./walk-three";

const root = document.querySelector<HTMLDivElement>("#app")!;
root.innerHTML = `<main class="walk-app">
<canvas id="garden" tabindex="0" aria-label="First-person view of the Stillwater garden"></canvas>
<header class="walk-header"><a class="wordmark" href="/">STILLWATER<span>A garden of small discoveries</span></a><div class="chapter"><span id="place">01 / THE LANDING</span><div id="progress" aria-label="Channel progress"></div></div></header>
<button id="capture-hint" class="capture-hint" hidden>Click for mouse look · WASD and arrows remain active</button>
<div id="crosshair" aria-hidden="true">+</div><p id="nearby"></p>
<div id="trace-frame" hidden></div><section id="trace-ui" hidden aria-label="Tablet controls"><div><span class="kicker">FIELD TABLET</span><h2 id="panel-title"></h2></div><p id="trace-help">Click the round spring. Follow the paths. Click the end. Esc pauses.</p><div class="trace-actions"><button id="undo">Undo <kbd>⌫</kbd></button><button id="reset">Retry <kbd>R</kbd></button><button id="leave">Leave tablet <kbd>E</kbd></button></div></section>
<div class="walk-bottom"><span id="mode">TAKE YOUR TIME</span><p id="status" role="status" aria-live="polite"></p><span id="saved">PROGRESS SAVES HERE</span></div>
<section id="pause" class="pause"><div class="pause-card"><span class="kicker">AN ISLAND LEFT IN YOUR CARE</span><h1 id="pause-title">Look slowly.<br>Find a way.</h1><p id="pause-copy">Someone tended this island long before you.<br>Follow the channels. Bring its lantern back to life.</p><button class="enter" id="enter">Enter the garden <span>↗</span></button><div class="control-guide"><span><kbd>W A S D</kbd> Walk</span><span><kbd>MOUSE</kbd> Look</span><span><kbd>CLICK / E</kbd> Use a tablet</span><span><kbd>ESC</kbd> Pause</span></div><details><summary>More controls & saved progress</summary><p>Shift: faster walking. E: enter or leave a tablet. Right click also leaves a tablet. Escape pauses walking or tracing; Resume returns to the same view with your trace intact. While tracing, R retries and Backspace undoes. You can drag, click adjacent points, or press Enter then arrow keys and Enter to submit. Arrow keys also turn your walking view.</p><button id="keyboard">Walk with keyboard look</button><p id="storage-note">This walk saves separately. Your original illustrated journey is still available below.</p></details><a class="atlas-link" href="/?atlas">Visit the original illustrated garden →</a></div><div class="pause-side"><span>THE CHANNEL WALK</span><p>Three tablets.<br>One quiet discovery.</p><span>STILLWATER / A FIRST-PERSON STUDY</span></div></section>
</main>`;
const el = <T extends HTMLElement = HTMLElement>(id: string) =>
  document.getElementById(id) as T;
const canvas = el<HTMLCanvasElement>("garden"),
  renderer = new GardenRenderer(canvas);
let threeView: ReturnType<typeof createGardenThree> | null = null;
if (new URLSearchParams(location.search).get("view") === "three") {
  void import("./walk-three").then(({ createGardenThree }) => {
    const viewCanvas = document.createElement("canvas"); viewCanvas.id = "garden-three";
    viewCanvas.setAttribute("aria-hidden", "true");
    viewCanvas.style.cssText = "position:absolute;inset:0;width:100%;height:100%;pointer-events:none";
    canvas.before(viewCanvas); threeView = createGardenThree(viewCanvas); canvas.style.position = "relative";
  }).catch((error: unknown) => { console.warn("3D view unavailable; using original view.", error); document.getElementById("garden-three")?.remove(); });
}

let storageFailed = false;
let raw: string | null = null;
try {
  raw = localStorage.getItem(WALK_STORAGE);
} catch {
  storageFailed = true;
}
let save = restoreWalk(raw);
let session = initialInteraction();
let mouseTrace = false,
  dragging = false,
  keyboardLook = false,
  firstVisit = true;
let player: Camera = { x: 0, y: 1.65, z: 8, yaw: 0, pitch: 0 },
  camera = { ...player };
const gate: number[] = panels.map((p) => (save.solved[p.puzzle.id] ? 1 : 0)),
  keys = new Set<string>();
let target: number | null = null,
  previousTime = performance.now(),
  lastPlace = "";
let audio: AudioContext | undefined;
let captureAttempt = 0,
  capturedPointer: number | null = null;
function chime(success: boolean) {
  try {
    audio ??= new AudioContext();
    void audio.resume();
    const now = audio.currentTime;
    (success ? [330, 440, 660] : [140, 110]).forEach((frequency, i) => {
      const osc = audio!.createOscillator(),
        gain = audio!.createGain(),
        t = now + i * 0.1;
      osc.frequency.value = frequency;
      gain.gain.setValueAtTime(0.035, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.55);
      osc.connect(gain);
      gain.connect(audio!.destination);
      osc.start(t);
      osc.stop(t + 0.6);
    });
  } catch {
    /* Sound is decorative; the visible response always remains. */
  }
}
function say(message: string) {
  el("status").textContent = message;
}
function persist() {
  try {
    localStorage.setItem(WALK_STORAGE, JSON.stringify(save));
  } catch {
    storageFailed = true;
  }
  el("saved").textContent = storageFailed
    ? "SAVED FOR THIS VISIT ONLY"
    : "PROGRESS SAVED";
  if (storageFailed)
    el("storage-note").textContent =
      "Browser storage is unavailable. The whole walk remains playable during this visit.";
}
function updateProgress() {
  const count = Object.keys(save.solved).length;
  el("progress").innerHTML = panels
    .map((p) => `<i class="${save.solved[p.puzzle.id] ? "lit" : ""}"></i>`)
    .join("");
  el("progress").setAttribute("aria-label", `${count} of 3 channels restored`);
}
function showMode() {
  el("pause").hidden = session.mode !== "pause";
  el("trace-frame").hidden = session.mode !== "panel";
  el("trace-ui").hidden = session.mode !== "panel";
  el("crosshair").hidden = session.mode !== "walk";
  el("nearby").hidden = session.mode !== "walk";
  el("mode").textContent =
    session.mode === "panel"
      ? "TRACING · E LEAVE · ESC PAUSE"
      : session.mode === "walk"
        ? keyboardLook
          ? "WASD WALK · ARROWS LOOK · ESC PAUSE"
          : "WASD WALK · MOUSE LOOK · ESC PAUSE"
        : "TAKE YOUR TIME";
  canvas.style.cursor = session.mode === "panel" ? "crosshair" : "default";
  el("capture-hint").hidden =
    session.mode !== "walk" || keyboardLook || session.capture !== "free";
}
function dispatch(event: InteractionEvent) {
  session = transition(session, event);
}
function stopTracing() {
  mouseTrace = false;
  dragging = false;
  if (capturedPointer !== null && canvas.hasPointerCapture(capturedPointer))
    canvas.releasePointerCapture(capturedPointer);
  capturedPointer = null;
}
function releaseMouseCapture() {
  captureAttempt++;
  if (document.pointerLockElement === canvas) {
    dispatch({ type: "release-capture" });
    document.exitPointerLock();
  }
}
function requestMouseCapture() {
  if (keyboardLook || session.mode !== "walk") return;
  if (document.pointerLockElement === canvas) {
    dispatch({ type: "capture-acquired" });
    showMode();
    return;
  }
  if (session.capture === "pending") return;
  const attempt = ++captureAttempt;
  dispatch({ type: "capture-requested" });
  showMode();
  const denied = () => {
    if (attempt !== captureAttempt || session.mode !== "walk") return;
    dispatch({ type: "capture-denied" });
    showMode();
  };
  try {
    // Called synchronously from E, a completion click/Enter, or a Resume click.
    // Browsers may require another click after an Escape unlock; walking stays active.
    void Promise.resolve(canvas.requestPointerLock()).catch(denied);
  } catch {
    denied();
  }
}
function pause(
  message = "Paused. Resume to pick up where you left off.",
  reason: "pause" | "focus-lost" = "pause",
) {
  dispatch({ type: reason });
  stopTracing();
  keys.clear();
  releaseMouseCapture();
  if (!firstVisit) {
    const inPanel = session.returnMode === "panel" && session.active !== null;
    el("pause-title").innerHTML = "A moment<br>of stillness.";
    el("pause-copy").textContent = inPanel
      ? "Your tablet and unfinished trace are held here."
      : message;
    el("enter").textContent = inPanel
      ? "Resume " + panels[session.active!].puzzle.title
      : "Resume exploration";
  }
  say(message);
  showMode();
  el("enter").focus();
}
function resume(withKeyboard?: boolean) {
  if (session.mode !== "pause") return;
  firstVisit = false;
  keys.clear();
  stopTracing();
  if (withKeyboard !== undefined) keyboardLook = withKeyboard;
  session = transition(session, { type: "resume" });
  showMode();
  canvas.focus();
  say(
    session.mode === "panel"
      ? "Your trace is kept. Continue from where you stopped."
      : "",
  );
  if (session.mode === "walk") {
    camera = { ...player };
    requestMouseCapture();
  }
}
function enterPanel(id: number) {
  if (session.mode !== "walk" || (id > 0 && !save.solved[id - 1])) return;
  keys.clear();
  stopTracing();
  dispatch({ type: "enter-panel", id });
  releaseMouseCapture();
  el("panel-title").textContent = panels[id].puzzle.title;
  say("");
  showMode();
  canvas.focus();
}
function leavePanel(completed = false) {
  if (session.mode !== "panel") return;
  dispatch({ type: completed ? "complete-panel" : "leave-panel" });
  stopTracing();
  keys.clear();
  camera = { ...player };
  if (!completed) say("Back in the garden.");
  showMode();
  canvas.focus();
  requestMouseCapture();
}
function resetTrace() {
  dispatch({ type: "trace", path: [] });
  stopTracing();
  say("A fresh line.");
  canvas.focus();
}
function undo() {
  dispatch({ type: "trace", path: session.path.slice(0, -1) });
  mouseTrace = session.path.length > 0;
  say("");
  canvas.focus();
}
function submit() {
  if (session.active === null) return;
  const puzzle = panels[session.active].puzzle,
    problem = validate(puzzle, session.path);
  mouseTrace = false;
  dragging = false;
  if (problem) {
    dispatch({ type: "reject" });
    say("The channel is still quiet. Look again, or press R to retry.");
    chime(false);
    return;
  }
  const wasSolved = !!save.solved[session.active];
  save = solvePanel(save, session.active, session.path);
  persist();
  updateProgress();
  say(
    wasSolved
      ? "The channel remembers. You are back in the garden."
      : "Channel restored. Follow the light to the open gate.",
  );
  chime(true);
  leavePanel(true);
}
function touch(point: Point) {
  if (session.active === null) return;
  if (session.error) {
    dispatch({ type: "trace", path: [] });
  }
  const next = extend(panels[session.active].puzzle, session.path, point);
  if (next !== session.path) {
    dispatch({ type: "trace", path: next });
    say("");
  }
}
function coordinates(e: PointerEvent) {
  const r = canvas.getBoundingClientRect();
  return { x: e.clientX - r.left, y: e.clientY - r.top };
}
canvas.addEventListener("pointerdown", (e) => {
  if (e.button !== 0) return;
  const { x, y } = coordinates(e);
  if (session.mode === "walk") {
    if (!keyboardLook && document.pointerLockElement !== canvas) {
      requestMouseCapture();
      return;
    }
    const id = renderer.panelAt(
      document.pointerLockElement ? canvas.clientWidth / 2 : x,
      document.pointerLockElement ? canvas.clientHeight / 2 : y,
    );
    if (id !== null) enterPanel(id);
    return;
  }
  if (session.mode !== "panel" || session.active === null) return;
  const point = renderer.nearestVertex(session.active, x, y);
  if (!point) return;
  const p = panels[session.active].puzzle;
  if (
    session.path.length &&
    same(point, p.end) &&
    same(session.path.at(-1)!, p.end) &&
    !session.error
  ) {
    submit();
    return;
  }
  touch(point);
  mouseTrace = session.path.length > 0;
  dragging = true;
  canvas.setPointerCapture(e.pointerId);
  capturedPointer = e.pointerId;
});
canvas.addEventListener("pointermove", (e) => {
  if (session.mode === "walk" && document.pointerLockElement === canvas) {
    player.yaw += e.movementX * 0.0024;
    player.pitch = Math.max(
      -1.1,
      Math.min(1.1, player.pitch - e.movementY * 0.0024),
    );
  } else if (
    session.mode === "panel" &&
    session.active !== null &&
    mouseTrace
  ) {
    const { x, y } = coordinates(e),
      point = renderer.nearestVertex(session.active, x, y);
    if (point) touch(point);
  }
});
canvas.addEventListener("pointerup", (e) => {
  const shouldSubmit =
    session.mode === "panel" &&
    session.active !== null &&
    dragging &&
    session.path.length > 1 &&
    same(session.path.at(-1)!, panels[session.active].puzzle.end);
  dragging = false;
  if (canvas.hasPointerCapture(e.pointerId))
    canvas.releasePointerCapture(e.pointerId);
  capturedPointer = null;
  if (shouldSubmit) submit();
});
canvas.addEventListener("pointercancel", () => {
  stopTracing();
  keys.clear();
});
document.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  if (session.mode === "panel") leavePanel();
});
document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === canvas) {
    dispatch({ type: "capture-acquired" });
    if (session.mode !== "walk") releaseMouseCapture();
  } else {
    const previousMode = session.mode;
    dispatch({ type: "capture-lost" });
    if (session.mode === "pause" && previousMode !== "pause")
      pause("Mouse released. Resume when you are ready.");
  }
  showMode();
});
document.addEventListener("pointerlockerror", () => {
  if (session.mode === "walk" && document.pointerLockElement !== canvas) {
    dispatch({ type: "capture-denied" });
    showMode();
  }
});
window.addEventListener("blur", () => {
  if (session.mode !== "pause")
    pause("The garden paused while you were away.", "focus-lost");
});
document.addEventListener("visibilitychange", () => {
  if (document.hidden && session.mode !== "pause")
    pause("The garden paused while you were away.", "focus-lost");
});
window.addEventListener("keydown", (e) => {
  const interaction = interactionKeyAction(session.mode, e.code, e.repeat);
  if (interaction === "leave-panel") {
    e.preventDefault();
    leavePanel();
    return;
  }
  if (interaction === "pause") {
    pause();
    return;
  }
  if (session.mode === "pause") return;
  if (
    e.target instanceof HTMLElement &&
    e.target.closest("button, a, summary, input, select, textarea")
  )
    return;
  if (interaction === "enter-panel") {
    e.preventDefault();
    if (target !== null) enterPanel(target);
    return;
  }
  if (
    [
      "KeyW",
      "KeyA",
      "KeyS",
      "KeyD",
      "ShiftLeft",
      "ShiftRight",
      "ArrowUp",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "Space",
      "Backspace",
      "Enter",
    ].includes(e.code)
  )
    e.preventDefault();
  if (session.mode === "walk") {
    keys.add(e.code);
    return;
  }
  if (session.active === null || e.repeat) return;
  if (e.code === "KeyR") {
    resetTrace();
    return;
  }
  if (e.code === "Backspace") {
    undo();
    return;
  }
  const puzzle = panels[session.active].puzzle;
  if (e.code === "Enter") {
    if (!session.path.length) touch(puzzle.start);
    else submit();
    return;
  }
  const delta: Record<string, Point> = {
    ArrowUp: [0, -1],
    ArrowDown: [0, 1],
    ArrowLeft: [-1, 0],
    ArrowRight: [1, 0],
  };
  if (delta[e.code] && session.path.length) {
    const p = session.path.at(-1)!,
      d = delta[e.code];
    touch([p[0] + d[0], p[1] + d[1]]);
  }
});
window.addEventListener("keyup", (e) => keys.delete(e.code));
el("enter").onclick = () => void resume();
el("keyboard").onclick = () => void resume(true);
el("leave").onclick = () => leavePanel();
el("capture-hint").onclick = () => {
  canvas.focus();
  requestMouseCapture();
};
el("reset").onclick = resetTrace;
el("undo").onclick = undo;

function frame(now: number) {
  const dt = Math.min((now - previousTime) / 1000, 0.05);
  previousTime = now;
  if (session.mode === "walk") {
    const turn =
      (Number(keys.has("ArrowRight")) - Number(keys.has("ArrowLeft"))) *
      dt *
      1.4;
    player.yaw += turn;
    player.pitch = Math.max(
      -1.1,
      Math.min(
        1.1,
        player.pitch +
          (Number(keys.has("ArrowUp")) - Number(keys.has("ArrowDown"))) * dt,
      ),
    );
    let forward = Number(keys.has("KeyW")) - Number(keys.has("KeyS")),
      strafe = Number(keys.has("KeyD")) - Number(keys.has("KeyA"));
    const length = Math.hypot(forward, strafe) || 1;
    forward /= length;
    strafe /= length;
    const speed =
      (keys.has("ShiftLeft") || keys.has("ShiftRight") ? 4.3 : 2.65) * dt;
    // Wait for a lifting gate to visibly clear before removing its collision.
    const physicalSave = { ...save, solved: { ...save.solved } };
    gate.forEach((v, i) => {
      if (v < 0.95) delete physicalSave.solved[i];
    });
    const next = movePlayer(
      player,
      (Math.sin(player.yaw) * forward + Math.cos(player.yaw) * strafe) * speed,
      (-Math.cos(player.yaw) * forward + Math.sin(player.yaw) * strafe) * speed,
      colliders(physicalSave),
    );
    player = { ...player, ...next };
    camera = { ...player };
    const arrived = arrive(save, player);
    if (arrived.arrived && !save.arrived) {
      save = arrived;
      persist();
      say(
        "Every channel flows again. Somewhere beyond the horizon, someone will see your lantern.",
      );
      chime(true);
    }
  } else if (session.mode === "panel" && session.active !== null) {
    const p = panels[session.active],
      blend = 1 - Math.exp(-dt * 11);
    const destination: Camera = {
      x: p.x,
      y: 1.65,
      z: p.z + 3.3,
      yaw: Math.round(player.yaw / (Math.PI * 2)) * Math.PI * 2,
      pitch: 0,
    };
    for (const key of ["x", "y", "z", "yaw", "pitch"] as const)
      camera[key] += (destination[key] - camera[key]) * blend;
  }
  if (session.mode !== "pause")
    gate.forEach(
      (v, i) => (gate[i] = Math.min(1, v + (save.solved[i] ? dt * 0.65 : 0))),
    );
  const viewState = { save, active: session.active, path: session.path, error: session.error, gate, time: now / 1000 };
  const visiblePanels = threeView ? threeView.render(camera, viewState, canvas.clientWidth, canvas.clientHeight) : null;
  renderer.render(camera, viewState, visiblePanels);
  target =
    session.mode === "walk"
      ? renderer.panelAt(canvas.clientWidth / 2, canvas.clientHeight / 2)
      : null;
  const nearby =
    target === null ? "" : `CLICK / E  ·  ${panels[target].puzzle.title}`;
  if (el("nearby").textContent !== nearby) el("nearby").textContent = nearby;
  const zone = Math.min(3, Math.max(0, Math.ceil(-player.z / 10)));
  const place = [
    "01 / THE LANDING",
    "02 / THE ORCHARD",
    "03 / THE TERRACES",
    "04 / THE LANTERN GARDEN",
  ][zone];
  if (lastPlace !== place) {
    el("place").textContent = place;
    lastPlace = place;
  }
  requestAnimationFrame(frame);
}
updateProgress();
showMode();
if (save.arrived) {
  firstVisit = false;
  pause("Your restored channels are ready to revisit.");
}
if (storageFailed) persist();
requestAnimationFrame(frame);
