# QA evidence

## Domain correctness

Independent author/solver used exhaustive simple orthogonal path enumeration and union-find cell connectivity, without importing production validation. Fourteen puzzles generate 1,888 candidates; production acceptance agrees for every candidate. Counts are recorded in puzzle-enumeration.json. Accepted counts: 12,10,48,5,54,12,5,4,4,8,124,4,2,1. Uniqueness is claimed only for the finale.

Eleven public-seam tests cover legal steps, bounds, start/end, repeated vertices and jumps, seed coverage, region boundary separation, border/interior notch counts, every combination on every candidate, backtracking and stopping at goal, graduated hints, corrupt saves, forged completions, dependencies and a valid complete saved journey. Initial legal-path test failed with Not implemented before green; malformed-save test failed with a deliberately incorrect stub before green. Recorded tool output confirmed both red/green transitions. Crossing orthogonal grid edges requires a repeated vertex, which is rejected; edges cannot repeat without repeating vertices.

## Actual Chrome gameplay on production build

On 2026-10-12, the supported user's Chrome browser completed all 14 panels in order through visible vertex buttons and region controls. Tablet 2 was completed with Start, arrow keys and Enter. All solutions came from independently solved fixtures; this is real visible-control completion, not a blind discovery playtest. No page evaluation, storage injection or hidden state mutation was used to restore a panel. First completion used no hints. After completion, the finale's three graduated hints were inspected and used for a keyboard replay on a narrow viewport; that replay was hint-assisted.

Observed: 3/14 landing ->7/14 orchard ->10/14 terraces ->14/14 finale. All region locks transitioned at the right prerequisites. Reload at 3/14 preserved completion; another reload after 14/14 preserved all restorations and hint progression. Revisit/replay retained the restored garden. Empty submission rejected. A completed trace with incorrect notch count rejected with “A notch has not found its balance.” Immediate backtracking, Undo, Reset, Cancel trace and keyboard Escape verified. Fresh-journey Keep cancelled; Start fresh reset the garden through visible controls after recording ending evidence, leaving 0/14 for the user.

Native pointer dragging replayed First Light in four continuous edge segments and submitted successfully. No Mac unlock or security changes were needed. Drag input, releasing and restarting at vertices worked. Browser pointercancel event is handled but explicit OS-level interruption was not forced. Automated input tests cover repeated/illegal steps; this distinction is intentional.

390x844 responsive viewport: panel fit with a 308px board and no horizontal overflow (document width and scroll width both375px, scrollbar excluded). Keyboard finale replay worked there. Screenshots inspected and stored in qa/ending.jpg, qa/landing.jpg and qa/narrow-panel.jpg. Temporary viewport was reset. Browser zoom shortcut was attempted but no clear scale change was observed; narrow layout verification should not be represented as measured browser zoom coverage. No real touchscreen or screen-reader session was performed; coordinate descriptions and focus were checked in source/AX. Corrupt-save recovery was tested at the domain seam, not by altering Chrome storage.

No game-origin errors observed in Chrome; extension-origin warnings were unrelated. Typecheck, production build and npm audit passed (0 vulnerabilities). Exact final CI evidence is available through the final GitHub commit's workflow run.

## Scope limits

Four navigable location scenes rather than free-roaming 3D, compact grids rather than commercial-game complexity, an observation map rather than perspective alignment. No cloud saves, paid assets, public publication, global installation, boot/login autostart, or sidebar registration. Earlier servers on ports5173–5206 were not altered.
