# Stillwater

A quiet original garden adventure about noticing small things. Four connected illustrated locations, fourteen line puzzles, three discoverable rule families, a reflection observation exercise and a final lantern. Inspired by the broad discovery-driven line puzzle structure of The Witness; every layout, image and story is original. No commercial assets or runtime network requests.

Play locally: http://127.0.0.1:5207/

## Run

Node 24 is used in CI. Install with `npm ci`, then `npm run build`. Start a session-only detached production preview:

```bash
cd /Users/intrepion/Documents/Codex/2026-10-11/task-23/kata-inspired-by-the-witness-codex-dot
node scripts/start-server.mjs
```

This logs its PID and writes server.log. It has no login/boot autostart. Stop only that logged PID with `kill PID`. If port 5207 is already serving, the script refuses a duplicate. Foreground alternative: `npm run preview`. Development: `npm run dev`.

## Controls

Touch the round spring, then drag or click neighboring points. Click the previous point to undo. Keyboard: Start trace, arrows, Enter to submit, Backspace to undo, Escape to cancel. Visible reset/cancel/undo buttons provide equivalents. Return to garden closes a tablet. Shapes reinforce colors; each tablet provides a coordinate description. Hints reveal observation, rule, then one route; using them is recorded. Progress saves in this browser. Begin a fresh journey clears progress after confirmation.

## Verification

`npm test`, `npm run verify:puzzles`, `npm run typecheck`, `npm run build`, `npm audit --audit-level=moderate`. Independent enumeration covers all 1,888 simple corner-to-corner candidates and compares every candidate to production validation. Only the last panel is unique. See [QA](docs/QA.md), [specification](docs/specification.md), [glossary](GLOSSARY.md) and [reviews](docs/reviews.md).

Scope is deliberately compact: location-based 2D exploration rather than free walking or a 3D camera. The reflection clue is a separate garden map with an accessible text equivalent. Saves are local to one origin/browser; no account or cloud sync. Built-in sound is an optional synthesized success chime.
