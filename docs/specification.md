# Stillwater specification

Build an original compact 2D island garden adventure, informed by the general line-drawing and discovery structure of The Witness. Four connected locations contain 14 authored panels. No commercial assets, copied layouts, 3D camera, timer, or punishment. Regions unlock sequentially after all panels in the preceding region; within a region panels may be explored freely. Final restoration reveals a conclusive story and replay controls.

## Autonomous design tree

The user authorized recommended defaults and no interview questions. Considered A: 3D island; B: watercolor atlas; C: botanical side-scroller; D: geometric observatory; E: environmental shadow labyrinth. Choose B+D: a hand-built SVG garden atlas, atmospheric scenes, tactile stone panels, daylight shifting as restoration progresses. The bold environmental idea becomes a accessible garden constellation with matching named coordinates, avoiding ambiguous camera alignment.

Settled frontier: scope -> 2D location-based exploration -> 4 linked regions -> 14 panels -> waypoint, monochrome region, exact edge-count families -> combinations and environmental observation -> persistent validated solutions -> deliberate finale. Trade-off: navigable atlas and region scenes over free walking allows reliable controls and authored composition on narrow screens.

## Rules and seams

The public domain seams under the user's authorized rigorous correctness scope are validate(puzzle,path), extend(puzzle,path,point), unlocked(region,save), restore(raw), and nextHint(puzzle,level). Tests exercise these APIs rather than DOM internals. Each step is orthogonal and adjacent, in bounds, with no repeated vertices/edges/intersections. Clicking previous vertex undoes one step. End must be last; reaching it does not submit until the player chooses Submit. Empty, malformed, partial and invalid traces never restore a panel. A seed must be touched. Distinct symbol kinds must lie in separate cell components after removing shared edges traversed by the trace. A notch counts all four cell perimeter edges, including border edges. No uniqueness promised.

## Interaction and accessibility

Pointer drag with capture, click vertices, keyboard arrows after Start, Enter submission, Escape cancellation, Backspace undo; visible equivalent buttons. Pointer interruptions retain editable trace, Escape clears it. Reset clears current trace only; revisits retain restorations and offer fresh editable replay. Hints graduate observation -> rule -> explicit route, persist level and disclose assistance. Symbols use shapes plus color; labels and coordinate names accessible. SVG scales with container, minimum hit targets, single-column mobile, reduced motion. Local storage failures must preserve playable session, warn, and corrupt or inconsistent saves must recover safely by revalidating every solution and dependencies.

## Acceptance

Independently enumerate all authored puzzles and compare all accepted solutions against domain validator. Record targeted red/green tests; cover input, flood fill, combinations, corruption, hints and unlocks. Independent spec and code reviews. Test/build/typecheck/audit and exact-commit CI. Real Chrome gameplay must visibly solve every puzzle without hidden-state mutation, plus invalid path, reset/undo/cancel, hints, reload, replay and narrow layout. Clearly separate any unavailable native drag validation from visible click gameplay.
