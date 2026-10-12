import "./style.css";
import { puzzles } from "./puzzles";
import type { Point } from "./puzzles";
import { extend, validate, nextHint, same } from "./domain";
import { fresh, restore, unlocked } from "./state";
import { scene, regions } from "./art";
const root = document.querySelector<HTMLDivElement>("#app")!;
const STORAGE = "stillwater.v1";
let storageWarning = "";
let raw: string | null = null;
try {
  raw = localStorage.getItem(STORAGE);
} catch {
  storageWarning = "Storage is unavailable. This visit can still be completed.";
}
let save = restore(raw),
  region = 0,
  active: number | null = null,
  path: Point[] = [],
  dragging = false,
  message = "";
let sound = false,
  audio: AudioContext | undefined;
function persist() {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(save));
  } catch {
    storageWarning =
      "Progress is kept for this visit; browser storage is unavailable.";
  }
}
function chime() {
  if (!sound) return;
  audio ??= new AudioContext();
  void audio.resume();
  [0, 4, 7].forEach((n, i) => {
    const o = audio!.createOscillator(),
      g = audio!.createGain(),
      t = audio!.currentTime + i * 0.1;
    o.type = "sine";
    o.frequency.value = 220 * 2 ** (n / 12);
    g.gain.setValueAtTime(0.04, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 1);
    o.connect(g);
    g.connect(audio!.destination);
    o.start(t);
    o.stop(t + 1);
  });
}
function button(text: string, id: string, disabled = false) {
  return `<button id="${id}" ${disabled ? "disabled" : ""}>${text}</button>`;
}
function render() {
  dragging = false;
  const solved = Object.keys(save.solved).length,
    complete = solved === puzzles.length,
    here = puzzles.filter((p) => p.region === region),
    lit = here.every((p) => save.solved[p.id]);
  root.innerHTML = `<header ${active !== null ? "inert" : ""}><a class="brand" href="#" aria-label="Stillwater home">STILLWATER<span>A garden of small discoveries</span></a><div class="header-right"><span>${solved} / 14 restored</span>${button(sound ? "Sound on" : "Sound off", "sound")}</div></header><main ${active !== null ? "inert" : ""}><div class="eyebrow">AN ISLAND LEFT IN YOUR CARE</div><div class="intro"><h1>${complete ? "The light you leave behind." : "Look slowly. Find a way."}</h1><p>${complete ? "Every channel flows again. Somewhere beyond the horizon, someone will see your lantern." : "Some places speak without words. Follow the paths, listen to the garden, and bring its lanterns back to life."}</p></div><nav aria-label="Island locations">${regions.map((r, i) => `<button data-region="${i}" ${unlocked(i, save) ? "" : "disabled"} aria-current="${region === i ? "page" : "false"}"><span>0${i + 1}</span>${r.name}<small>${unlocked(i, save) ? puzzles.filter((p) => p.region === i && save.solved[p.id]).length + " / " + puzzles.filter((p) => p.region === i).length : "Locked"}</small></button>`).join("")}</nav><section class="landscape">${scene(region, lit)}<div class="scene-caption"><span>${regions[region].subtitle}</span><strong>${regions[region].name}</strong></div><span class="scene-label">${lit ? "CHANNEL RESTORED" : "LISTEN TO THE GARDEN"}</span></section><div class="region-content"><section class="journal"><div class="eyebrow">FIELD NOTES / 0${region + 1}</div><h2>${regions[region].name}</h2><p>${regions[region].story}</p>${lit ? `<blockquote>${regions[region].memory}</blockquote>` : '<p class="muted">Restore the tablets to uncover a memory.</p>'}${region < 3 ? button("Walk to " + regions[region + 1].name, "next-region", !unlocked(region + 1, save)) : complete ? '<div class="ending"><h3>The garden is yours now.</h3><p>Thank you for noticing the small things. Revisit any tablet to try another path.</p>' + button("Begin a fresh journey", "fresh") + "</div>" : ""}<details><summary>How to trace</summary><p>Touch the round spring, then neighboring points. Drag or click. Keyboard: Start trace, then arrows. Enter submits; Backspace undoes; Escape cancels. The square lantern ends your trace.</p><p>Discover symbols through the first examples. Optional hints reveal one layer at a time. Progress saves on this browser.</p></details></section><section class="tablets" aria-label="Garden tablets"><div class="eyebrow">STONE TABLETS</div>${here.map((p) => `<button class="tablet ${save.solved[p.id] ? "restored" : ""}" data-panel="${p.id}"><span class="tablet-number">${String(p.id + 1).padStart(2, "0")}</span><span><strong>${p.title}</strong><small>${save.solved[p.id] ? "Restored · revisit" : "An unfinished thought"}</small></span><span class="tablet-mark">${save.solved[p.id] ? "✦" : "↗"}</span></button>`).join("")}</section></div>${storageWarning ? `<p role="status">${storageWarning}</p>` : ""}<footer>ORIGINAL PUZZLES. QUIET DISCOVERIES. <span>Take your time.</span></footer></main>${active !== null ? panel() : ""}`;
  root.querySelector(".brand")!.addEventListener("click", (e) => {
    e.preventDefault();
    active = null;
    render();
  });
  root.querySelector("#sound")!.addEventListener("click", () => {
    sound = !sound;
    chime();
    render();
  });
  root.querySelectorAll<HTMLButtonElement>("[data-region]").forEach(
    (b) =>
      (b.onclick = () => {
        region = Number(b.dataset.region);
        active = null;
        render();
      }),
  );
  root.querySelectorAll<HTMLButtonElement>("[data-panel]").forEach(
    (b) =>
      (b.onclick = () => {
        active = Number(b.dataset.panel);
        path = [];
        message = "";
        render();
        document.querySelector<HTMLButtonElement>("#start")?.focus();
      }),
  );
  root
    .querySelector<HTMLButtonElement>("#next-region")
    ?.addEventListener("click", () => {
      region++;
      render();
    });
  root
    .querySelector<HTMLButtonElement>("#fresh")
    ?.addEventListener("click", () => {
      const box = document.createElement("div");
      box.className = "confirm";
      box.innerHTML =
        "<p>Start again? This clears the saved journey on this browser.</p>" +
        button("Keep my garden", "keep") +
        button("Start fresh", "confirm-fresh");
      root.append(box);
      box.querySelector("#keep")!.addEventListener("click", () => box.remove());
      box.querySelector("#confirm-fresh")!.addEventListener("click", () => {
        save = fresh();
        persist();
        region = 0;
        active = null;
        render();
      });
    });
  if (active !== null) {
    bindPanel();
    document.querySelector<HTMLButtonElement>("#start")?.focus();
  }
}
function panel() {
  const p = puzzles[active!];
  return `<div class="overlay"><section class="panel" role="dialog" aria-modal="true" aria-labelledby="panel-title"><div class="panel-heading"><div><div class="eyebrow">TABLET ${String(p.id + 1).padStart(2, "0")} / ${regions[p.region].name}</div><h2 id="panel-title">${p.title}</h2></div>${button("Return to garden", "close")}</div><p class="panel-poem">${p.note}</p>${p.observation ? `<p class="observation">Look at the lantern reflections in the garden. Which grid points do they touch?</p><div class="reflection" role="img" aria-label="Two lantern reflections at column 1 row 2 and column 2 row 1 on a four by four point garden map"><svg viewBox="0 0 240 130" aria-hidden="true"><rect width="240" height="130" rx="8" fill="#315d59"/><path d="M35 25H205M35 52H205M35 79H205M35 106H205M35 25V106M92 25V106M148 25V106M205 25V106" stroke="#829c82" stroke-width="2"/><circle cx="92" cy="79" r="9" fill="#f3dda8"/><circle cx="148" cy="52" r="9" fill="#f3dda8"/><path d="M92 89v12M148 62v12" stroke="#f3dda8" opacity=".5" stroke-width="4"/></svg></div><details><summary>Garden clue in words</summary><p>${p.observation}</p></details>` : ""}<div class="board" tabindex="0" aria-label="Trace grid. Start with the round spring. Use arrow keys to trace."><svg viewBox="0 0 400 400" aria-hidden="true"><rect x="40" y="40" width="320" height="320" rx="8" class="grid-frame"/>${Array.from({ length: p.size + 1 }, (_, i) => `<path d="M${40 + (i * 320) / p.size} 40V360M40 ${40 + (i * 320) / p.size}H360" class="grid-line"/>`).join("")}${p.symbols
    .map((s) => {
      const x = 40 + ((s.cell[0] + 0.5) * 320) / p.size,
        y = 40 + ((s.cell[1] + 0.5) * 320) / p.size;
      return s.kind === "leaf"
        ? `<path d="M${x - 10} ${y + 10}Q${x - 18} ${y - 15} ${x + 13} ${y - 13}Q${x + 18} ${y + 12} ${x - 10} ${y + 10}Z" fill="#99c8a2"/>`
        : `<rect x="${x - 10}" y="${y - 10}" width="20" height="20" fill="#e8d6b4"/>`;
    })
    .join(
      "",
    )}${p.triangles.map((t) => `<text x="${40 + ((t.cell[0] + 0.5) * 320) / p.size}" y="${45 + ((t.cell[1] + 0.5) * 320) / p.size}" class="notch">${"▴".repeat(t.count)}</text>`).join("")}${(p.observation ? [] : p.waypoints).map((a) => `<path d="M${40 + (a[0] * 320) / p.size} ${32 + (a[1] * 320) / p.size}l8 8-8 8-8-8Z" fill="#ead3a1"/>`).join("")}<polyline id="trace" class="trace" points=""/></svg>${Array.from(
    { length: (p.size + 1) ** 2 },
    (_, i) => {
      const x = i % (p.size + 1),
        y = Math.floor(i / (p.size + 1)),
        a: Point = [x, y],
        start = same(a, p.start),
        end = same(a, p.end);
      return `<button class="vertex ${start ? "spring" : end ? "lantern" : ""}" style="left:${10 + (x * 80) / p.size}%;top:${10 + (y * 80) / p.size}%" data-x="${x}" data-y="${y}" aria-label="Point ${x},${y}${start ? " spring" : end ? " lantern" : !p.observation && p.waypoints.some((b) => same(a, b)) ? " seed" : ""}"><span></span></button>`;
    },
  ).join(
    "",
  )}</div><div class="symbol-key" aria-label="Panel symbols">${p.waypoints.length && !p.observation ? "◆ Seeds " : ""}${p.symbols.length ? "◒ Leaf · ■ Stone " : ""}${p.triangles.length ? "▴ Notches " : ""}</div><details class="panel-description"><summary>Tablet description in words</summary><p>${p.observation ? "Reflections are shown in the garden map above." : p.waypoints.map((a) => "Seed at point " + a.join(",")).join("; ")} ${p.symbols.map((s) => s.kind + " in cell " + s.cell.join(",")).join("; ")} ${p.triangles.map((t) => t.count + " notch marks in cell " + t.cell.join(",")).join("; ")} Coordinates count from zero, left to right and top to bottom.</p></details><p id="feedback" role="status" aria-live="polite">${message || "The spring is round. The lantern is square."}</p><div class="controls">${button("Start trace", "start")}${button("Undo", "undo")}${button("Reset", "reset")}${button("Cancel trace", "cancel")}${button("Submit trace", "submit")}</div><div class="hint-row">${button("Hint " + Math.min((save.hints[p.id] || 0) + 1, 3) + " / 3", "hint")}<span>${save.hints[p.id] ? "Hint-assisted exploration" : "Hints are optional."}</span></div><p id="hint-text">${save.hints[p.id] ? p.hints[save.hints[p.id] - 1] : ""}</p>${save.solved[p.id] ? '<p class="restoration">✦ Already restored. New traces are a replay; your garden stays lit.</p>' : ""}</section></div>`;
}
function updateTrace() {
  const p = puzzles[active!];
  document
    .querySelector("#trace")!
    .setAttribute(
      "points",
      path
        .map(
          (a) => `${40 + (a[0] * 320) / p.size},${40 + (a[1] * 320) / p.size}`,
        )
        .join(" "),
    );
  document.querySelector("#feedback")!.textContent =
    message ||
    `${path.length - 1 > 0 ? path.length - 1 : 0} edges traced. ${path.length && same(path.at(-1)!, p.end) ? "Lantern reached. Submit when ready." : "Follow a neighboring point."}`;
}
function add(a: Point) {
  path = extend(puzzles[active!], path, a);
  message = "";
  updateTrace();
}
function submit() {
  const p = puzzles[active!],
    error = validate(p, path);
  message = error || "✦ Restored. A little more light returns to the garden.";
  if (!error) {
    save.solved[p.id] = path.map((a) => [...a] as Point);
    persist();
    chime();
    render();
  } else updateTrace();
}
function bindPanel() {
  const p = puzzles[active!],
    board = document.querySelector<HTMLDivElement>(".board")!;
  document.querySelector("#close")!.addEventListener("click", () => {
    const opener = active;
    active = null;
    path = [];
    render();
    document
      .querySelector<HTMLButtonElement>(`[data-panel="${opener}"]`)
      ?.focus();
  });
  document.querySelector("#start")!.addEventListener("click", () => {
    path = [p.start];
    message = "";
    updateTrace();
    board.focus();
  });
  for (const id of ["reset", "cancel"])
    document.querySelector("#" + id)!.addEventListener("click", () => {
      path = [];
      dragging = false;
      message =
        id === "cancel"
          ? "Trace cancelled."
          : "Tablet cleared. Try a new thought.";
      updateTrace();
    });
  document.querySelector("#undo")!.addEventListener("click", () => {
    path = path.slice(0, -1);
    message = "";
    updateTrace();
  });
  document.querySelector("#submit")!.addEventListener("click", submit);
  document.querySelector("#hint")!.addEventListener("click", () => {
    const h = nextHint(p, save.hints[p.id] || 0);
    save.hints[p.id] = h.level;
    persist();
    document.querySelector("#hint-text")!.textContent = h.text;
    document.querySelector("#hint")!.textContent =
      `Hint ${Math.min(h.level + 1, 3)} / 3`;
    document.querySelector(".hint-row span")!.textContent =
      "Hint-assisted exploration";
  });
  board.querySelectorAll<HTMLButtonElement>(".vertex").forEach((b) => {
    b.addEventListener("pointerdown", (e) => {
      if (e.button !== 0) return;
      e.preventDefault();
      dragging = true;
      board.setPointerCapture(e.pointerId);
      board.focus();
      add([Number(b.dataset.x), Number(b.dataset.y)]);
    });
    b.addEventListener("click", (e) => {
      if (e.detail === 0) add([Number(b.dataset.x), Number(b.dataset.y)]);
    });
  });
  board.addEventListener("pointermove", (e) => {
    if (!dragging) return;
    const r = board.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width,
      y = (e.clientY - r.top) / r.height,
      gx = Math.round(((x - 0.1) * p.size) / 0.8),
      gy = Math.round(((y - 0.1) * p.size) / 0.8);
    if (
      Math.hypot(
        x - (0.1 + (gx * 0.8) / p.size),
        y - (0.1 + (gy * 0.8) / p.size),
      ) < 0.075
    )
      add([gx, gy]);
  });
  for (const name of ["pointerup", "pointercancel", "lostpointercapture"])
    board.addEventListener(name, () => {
      dragging = false;
    });
  board.addEventListener("keydown", (e) => {
    const directions: Record<string, Point> = {
      ArrowUp: [0, -1],
      ArrowDown: [0, 1],
      ArrowLeft: [-1, 0],
      ArrowRight: [1, 0],
    };
    if (directions[e.key]) {
      e.preventDefault();
      if (!path.length) add(p.start);
      else {
        const a = path.at(-1)!,
          d = directions[e.key];
        add([a[0] + d[0], a[1] + d[1]]);
      }
    } else if (e.key === "Enter") {
      e.preventDefault();
      submit();
    } else if (e.key === "Backspace") {
      e.preventDefault();
      path = path.slice(0, -1);
      message = "";
      updateTrace();
    }
  });
  document.querySelector(".panel")!.addEventListener("keydown", (e) => {
    const k = e as KeyboardEvent;
    if (k.key === "Escape") {
      k.preventDefault();
      path = [];
      dragging = false;
      message = "Trace cancelled.";
      updateTrace();
    }
    if (k.key === "Tab") {
      const buttons = [
        ...document.querySelectorAll<HTMLButtonElement>(".panel button"),
      ];
      const first = buttons[0],
        last = buttons.at(-1)!;
      if (k.shiftKey && document.activeElement === first) {
        k.preventDefault();
        last.focus();
      } else if (!k.shiftKey && document.activeElement === last) {
        k.preventDefault();
        first.focus();
      }
    }
  });
  updateTrace();
}
render();
