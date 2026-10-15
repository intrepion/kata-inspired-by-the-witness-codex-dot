# Independent review: channel walk

Baseline: clean `main`, HEAD `8671bb721fa0ec302c6da6de20fbebf9b4229480`. No commit or push performed. Two independent read-only reviewers ran the local Matt Pocock code-review skill's Standards and Spec axes against the candidate overlay and original baseline. This adapts its committed-diff workflow to the user's explicit uncommitted-work requirement.

## Standards

One P2 finding: two-corner rectangular panel targeting disagreed with the projected panel at oblique views. Fixed with a four-corner convex-polygon hit test. The reviewer reran its concrete counterexample: visible `(770,170)` now hits panel 0 and outside `(510,650)` returns null. No documented standard violations or remaining findings on recheck. Runtime dependencies, original artwork/data and pure domain boundaries are retained. Reviewer independently ran 14 tests and typecheck successfully.

## Spec

P2: global Enter could submit a complete trace before activating a focused Undo, Retry or Return button. Fixed by excluding interactive event targets and preventing default Enter only on the game surface. Browser verification focused Retry and Return with complete unsubmitted routes; both left progression at 1/3 as intended.

P3: rejected traces were static red despite the design promising a pulse. Fixed with a restrained time-varying color and steady reduced-motion feedback. Stale capture-failure status is cleared on resume. Reviewer rechecked all changes and reported no further findings.

## Browser-discovered correction

At a pitched viewpoint, per-edge painter sorting could bury part of the grid under its tablet face. The renderer now composites markings after the tablet geometry, within a shared world-depth group. Oblique spring/grid visibility and all three subsequent solves were observed in Chrome. The final Standards follow-up covers this change.

Final Standards follow-up caught front markings visible through the rear casing after compositing. Guarded markings to the front-facing side. Reviewer reproduced zero rear grid strokes/labels, while the front view retained six grid strokes and both labels. Candidate and installed renderer matched. Final outcome: **Standards 0 outstanding; Spec 0 outstanding**.


E-exit follow-up: independent read-only review of `walk-input.ts`, its integration and tests found no issues. E uses the existing cancellation/focus flow; repeat handling preserves one mode change per press, and focused-button Enter behavior remains unchanged.


## Corrected interaction model: pause suspends, leave/complete resumes walking

Independent Standards review found no actionable issues in the pure session transitions or UI/pointer-lock effects. Seven new transition tests cover E exit, completion, pause/resume from each mode, trace/error preservation, expected versus unexpected unlocks, denial and late acquisition. Independent Spec review initially found the stale written cancellation contract; the current design/README/ADR were corrected and rechecked with no remaining findings. Browser verification separately observed direct E/right-click/completion returns, Escape restoration of both modes, and real tab-focus-loss trace preservation. The full actual checkout suite passed 23/23, plus typecheck/build.
