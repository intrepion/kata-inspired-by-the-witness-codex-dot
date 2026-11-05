# Walking graphics regression QA — 2026-11-05

## Scope and baseline

Work started from main commit `8e02441264449db29398be7491e063c2fd972401` in an isolated local checkout. The user approved testing movement/camera behavior and rendered frames. The installed TDD skill was followed: each reproduced defect received a failing test before its correction. At the local review checkpoint, no commit, push, merge, or deployment had been made. Publication was subsequently approved by the user.

This fixes the default Canvas channel walk. The experimental `?view=three` view remains opt-in; its existing center-ray panel occlusion approximation is not replaced by this change. Atlas gameplay, progression, saves, and controls were not changed.

## Reproductions and red-to-green evidence

The baseline's 26 tests passed despite the reported graphical defects. New tests render with real Canvas pixels through `GardenRenderer.render`/`project`, rather than asserting internal calls or sorting keys.

1. A channel disappeared entirely when one endpoint passed behind the camera. At camera `(-2.65,1.65,2)`, yaw 0, pitch -0.4, pixel `(550,625)` was ground `[148,164,124]` instead of channel `[89,109,96]`. Near-plane segment clipping made the test pass.
2. Turning next to a gate wall revealed its farther surface over its front. At camera `(-6,1.65,1)`, yaw 1.6, the visible front point `(-4,1,.325)` was rear/side color `[153,166,142]` instead of `[181,186,163]`. Hidden-face rejection made the test pass; the regression covers adjacent yaw values.
3. Paving drew through the back of a tablet. At camera `(0,1.65,1.5)`, yaw -2, pitch -.2, pixel `(452,407)` was paving `[213,210,179]` instead of tablet back `[48,78,72]`. Surface splitting and back-to-front traversal replaced average-depth sorting, and tablet surfaces are no longer grouped into a single depth. The regression now covers walking positions and multiple turns.
4. Review detected that the original foliage winding differs from solid boxes. The new front-facet test failed before foliage was explicitly retained as two-sided.
5. Review detected angled title clipping after the depth change. The failing title test counted 85 opaque pixels on the left and only 3 on the right. Placing visibility bounds on the label's actual world plane fixed it.
6. A preservation test covers grid strokes, panel picking, and vertex picking at nine pitched/turned viewpoints.

`@napi-rs/canvas` is development-only. The production game still makes no new runtime dependency or asset requests. The manual fixture page at `/tests/graphics-preview.html` is available through Vite development only and is not a production entry point.

## Automated checks

- `npm test`: 32 passed, 0 failed.
- `npm run verify:puzzles`: all 14 puzzles, 1,888 paths verified.
- `npm run typecheck`: passed.
- `npm run build`: passed. Existing optional Three.js bundle-size warning remains.
- `npm audit --audit-level=moderate`: 0 vulnerabilities.
- `git diff --check`: passed.
- Independent code review identified the foliage and title issues above; both were corrected and retested.

A warmed 80-frame Node Canvas yaw sweep at 1100×640 measured median 9.06 ms, 95th percentile 16.83 ms, maximum 20.84 ms in this run. This is a local rendering probe, not a cross-device browser FPS guarantee.

## Browser observations

Chrome on the connected Mac, local `http://127.0.0.1:5217/`:

- Reproduced the original default game's walking/turning views before edits.
- Inspected deterministic wall and tablet-back fixtures before/after correction. Paving no longer crosses through the tablet.
- Walked to each of the three tablets, solved all three via actual keyboard controls, saw each restored trace/channel and rising gate, and walked to the lantern ending.
- Paused the first tablet with an unfinished trace, resumed, and completed the same trace.
- Turned back after passing the first gate, then returned to the orchard; later performed another full turn near the lantern.
- Checked ground, tree, gate, panel, and lantern layering in captured views.

Limitations: screenshots and sampled pixels do not prove every frame/view. Actual touch devices, other operating systems/browsers, and the experimental Three.js partial-occlusion behavior were not comprehensively validated. BSP fragment antialiasing may warrant further cross-browser visual checks at unusual views.

Final browser check: reload retained all three restored channels and the completed lantern state. No game-origin errors appeared in the captured warnings/errors; the listed warnings came from an installed browser extension. Final independent rereview reported no remaining concrete blockers. The local preview was left open for review.
