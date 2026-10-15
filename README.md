# Stillwater

A quiet original garden about noticing small things. The default **channel walk** is a compact first-person area: approach three world-mounted line panels, infer a rule, restore their channels, and walk through the gates to the lantern. Original geometric artwork, puzzle layouts and story; no commercial assets or runtime dependencies/network requests.

The original fourteen-panel illustrated adventure remains at [the atlas journey](http://localhost:5207/?atlas). Its source and `stillwater.v1` save are unchanged. The new route uses the separate `stillwater.walk.v1` save. Progress is local to each browser/origin.

Play locally: http://127.0.0.1:5207/

## Run

Node 24 is used in CI. Install with `npm ci`, then `npm run build`. Start a session-only detached production preview:

```bash
cd /Users/intrepion/Documents/Codex/2026-10-11/task-23/kata-inspired-by-the-witness-codex-dot
node scripts/start-server.mjs
```

This logs its PID and writes server.log. It has no login/boot autostart. Stop only that logged PID with `kill PID`. If port 5207 is already serving, the script refuses a duplicate. Foreground alternative: `npm run preview`. Development: `npm run dev`.

## Controls

Click **Enter the garden** to capture the mouse. **WASD** walks; **mouse** looks; **Shift** walks faster. Aim at a nearby panel and **click/E**. Click its round spring, trace adjacent grid edges, then click the endpoint. **E/right click** leaves the tablet directly into active exploration; a valid solve does the same. Leaving discards the current unfinished trace but preserves restored channels. Hold/repeat E never toggles modes; release it before another interaction.

**Escape pauses** both walking and tracing. **Resume** returns to the same mode, panel and unfinished trace. **R** retries and **Backspace** undoes while tracing. Enter/arrows/Enter provides keyboard tracing; More controls offers keyboard look. Mouse capture is requested directly when returning to exploration. If the browser requires a fresh click, an inline **Click for mouse look** prompt appears while WASD/arrow exploration remains active. Actual focus loss pauses and preserves the prior session.

[Design and acceptance](docs/first-person-sample.md), [observed browser QA](docs/first-person-qa.md), [independent review](docs/first-person-reviews.md). This is one teaching route, not a complete island or campaign; advanced environmental viewpoint puzzles remain outside this sample.

## Original atlas controls

Touch the round spring, then drag or click neighboring points. Click the previous point to undo. Keyboard: Start trace, arrows, Enter to submit, Backspace to undo, Escape to cancel. Visible reset/cancel/undo buttons provide equivalents. Return to garden closes a tablet. Shapes reinforce colors; each tablet provides a coordinate description. Hints reveal observation, rule, then one route; using them is recorded. Progress saves in this browser. Begin a fresh journey clears progress after confirmation.

## Verification

`npm test`, `npm run verify:puzzles`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=moderate`. Independent enumeration covers all 1,888 simple corner-to-corner candidates and compares every candidate to production validation. Only the last panel is unique. See [QA](docs/QA.md), [specification](docs/specification.md), [glossary](GLOSSARY.md) and [reviews](docs/reviews.md).

The original atlas includes four illustrated locations, fourteen puzzles, three rule families and a separate reflection observation map with an accessible text equivalent. The channel walk adds first-person exploration and physical progression while retaining the atlas for existing players. There is no account or cloud sync.
