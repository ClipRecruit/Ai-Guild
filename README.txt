AI GUILD WORLD-002 — FIRST BUILD

CONTENTS
  index.html        -> GitHub repository ROOT
  src/engine.js     -> GitHub repository src/ folder
  README.txt        -> optional

IMPORTANT: GitHub's upload interface can flatten folder structure. Check that
engine.js is INSIDE src, not beside index.html.

This experimental build introduces a floating three-tier island, rock cliffs,
three-quarter perspective camera, grass texture, day/night lighting and five
selectable temporary character markers. Existing HTML UI, quests and save data
remain in index.html. The previous Canvas renderer remains a fallback.

Three.js is loaded from a pinned CDN and needs internet access. This build has
not been visually tested in a real browser. Character motion is temporary
presentation animation, not terrain-aware pathfinding. Pixel-art sprites and
building placement are not yet migrated.

GITHUB SAFE UPLOAD
1. Keep main unchanged. Create branch feature/world-002 from main.
2. Upload index.html at repository root on that branch.
3. Upload engine.js into src/ on that branch, replacing old src/engine.js.
4. Verify file paths and commit.
5. Test GitHub Pages on a preview deployment or local server before merging.
   GitHub Pages normally deploys the configured branch, not automatically the
   feature branch. If testing directly on Pages, use a temporary separate
   deployment; do not switch production Pages casually.
6. Merge only after confirming rendering, quests, selection, and saves.

ROLLBACK: revert the WORLD-002 commit or restore previous files from Git history.
