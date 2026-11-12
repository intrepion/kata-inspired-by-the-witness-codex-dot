# Keyboard and mouse look check (2026-11-12)

Scope: local fix/keyboard-mouse-camera, Windows Chrome via HTTP localhost (5479).
No file:// testing, deployed change, or claimed OS-level touchpad fix.

## Findings
- Keyboard movement has no direct gate suppressing locked mouse movement.
- Selecting keyboard-only look prevented mouse capture and hid the recovery hint;
  ordinary Resume also retained that setting. Fixed the explicit recovery path.
- Pointer lock did not acquire in this controlled browser session. An attempted
  request reported WrongDocumentError. This may be a browser/automation limitation,
  not the cause of Oliver's report.
- Added left-button drag look while capture is unavailable. It reads client-coordinate
  deltas, independently of WASD. Lock acquisition, release, pause and cancellation
  discard drag state. Normal locked relative movement retains its existing filter.

## Checks
- 46 Node tests pass, including interleaved movement with locked and drag look,
  drag cleanup, finite-input validation and pitch limits.
- TypeScript typecheck and production build pass. Existing optional Three.js chunk
  size warning remains.
- Localhost visual: left drag changes view; parallel W (one-second hold) and drag
  actions visibly both advance toward the gate and turn the view.
- Keyboard-only mode exposes mouse recovery; clicking it changes HUD from arrows
  look back to mouse look. Escape still pauses.

## Limits
Successful real pointer-lock capture and hardware touchpad motion while typing
were not verified. The exact only-while-key-held symptom could involve OS palm
rejection; no OS settings were changed. Do not describe this as proof that all
possible causes of the original report are resolved.
