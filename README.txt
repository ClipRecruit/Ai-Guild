AI Guild ENGINE-001 — First Build (experimental)

Open index.html in a modern browser with internet access. The first build loads Three.js
from a pinned jsDelivr URL. Some browsers block module loading from file://; if so,
serve this folder using a local HTTP server (e.g. python -m http.server 8000).

If Three.js cannot load, the original Canvas 2D world stays visible and functional.
No quest, save, or guild logic was intentionally changed.

The Three.js view currently uses temporary colored character tokens, not finished sprites.
The camera's ~25% sky framing is a calibration target, not yet screenshot-verified.
This is a first-stage engine integration, not a completed ENGINE-001 migration.
