# Walking camera input correction

2026-11-08. Baseline: `68a8fc6c4e7378016bfe69cd05d68bc20e49d73f` (verified identical to GitHub main). The checkout was clean before this task. These checks were completed before publication approval.

## Cause and correction

The walking handler applied every `pointermove` relative delta directly to yaw/pitch. A bad 1,200px horizontal sample therefore rotated the camera by 2.88 radians (165 degrees); a capture/recenter event could also change the view before deliberate looking began.

Camera look now uses the Pointer Lock mouse-event stream, independently of tablet pointer tracing. Its input filter discards the first event after capture or recapture, rejects nonfinite data, and holds unusually large samples rather than immediately turning. Normal sensitivity and pitch limits are unchanged. Capture loss/release clears all held input.

A fixed cutoff was rejected during review because it also stopped fast intentional turns. Samples exceeding 256px on either axis are instead corroborated by similar-sized, similarly directed motion within 50ms. A corroborated pair preserves the full displacement; subsequent matching samples apply immediately. A normal, opposite, delayed, or disproportionate sample cannot replay an isolated warp.

This is a heuristic: a single genuinely large movement can be dropped, and paired erroneous movement resembling a sustained turn can pass. Corroborated high-sensitivity movement can apply its held displacement on the next event. The fix does not claim to identify every hardware/driver anomaly.

## Test-first evidence

Ten regressions exercise the public camera-input behavior. Red checks included:

- A 1,200px spike changed yaw from 0.7 to 3.58 instead of preserving it.
- The observed capture-transition example (-17px, 195px) altered yaw and pitch instead of preserving the view.
- A NaN sample poisoned yaw.
- The first cutoff version stalled sustained 300px samples.
- Spreading an event with inherited movement getters lost its fields and also stalled those samples; explicit field copying fixes this native-event distinction.

Normal sensitivity, continuous fast turning, pitch limits, immediate recovery, recapture resets, stale/opposite/disproportionate samples, and browser-style event properties are covered.

## Served browser verification

Google Chrome on macOS, actual game at `http://127.0.0.1:5207/`, not a file URL. The origin already held 3/3 restored channels; no save was cleared or puzzle submitted.

Native input observations:

- Before the fix, capture followed by a controlled horizontal drag delivered an initial (-17, 195) reposition event, visibly pitching the view downward, followed by the intended horizontal samples. This is a controlled native-input reproduction, not proof of the user's exact intermittent hardware trigger.
- After the fix, the same 100px horizontal drag left pitch at zero and yaw at 0.24. Holding W moved the camera from the landing to approximately (0.6404, 5.3830), with no unintended pitch change.
- Arrow-key look aimed at First Light; E opened its tablet. A native pointer drag drew a partial horizontal trace. Escape paused it, Resume First Light retained that trace, and E returned to active exploration with mouse capture.

Controlled event integration checks in the running app (separate from native-input claims):

- Injected `MouseEvent` movement (1200, 900) preserved the rendered camera exactly. A following (10, -5) changed yaw by 0.024 and pitch by 0.012.
- First movement after Resume and after E exit preserved the view.
- A pen `pointermove` did not turn the camera.
- Ten real `MouseEvent` objects carrying 300px horizontal samples on successive animation frames changed yaw by 7.199999999999998 radians, confirming the fast-turn path works with browser accessors.

For measurement only, a temporary wrapper observed the camera passed to the renderer. No player or storage setters were used. Reload removed the wrapper and event diagnostics after verification. The tab ended paused at its fresh entry screen; mouse capture was released.

## Final verification

- `npm test`: 42/42 passed, including the original 32 tests and ten new camera tests.
- `npm run verify:puzzles`: 14 puzzles, 1,888 routes; generated report unchanged.
- `npm run typecheck`: passed.
- `npm run build`: passed. Existing optional Three.js chunk-size warning remains.
- `npm audit --audit-level=moderate`: zero vulnerabilities.
- `git diff --check`: passed.

No Safari/Firefox, physical high-DPI device matrix, touch hardware, or long-duration intermittent-driver reproduction was performed. The experimental Three.js renderer uses the same input handler but was not separately replayed in the browser. Existing rendering, collision, session, puzzle and projection tests remain green.
