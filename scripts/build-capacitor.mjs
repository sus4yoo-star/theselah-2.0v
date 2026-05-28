/**
 * Builds the STATIC mobile-app bundle into /out.
 *
 * Why this script exists:
 *   `output: 'export'` cannot coexist with server-only features —
 *   API route handlers (/src/app/api) and middleware (/src/middleware.ts).
 *   They're needed by the web/Netlify build, so we don't delete them.
 *   Instead we temporarily move them aside, run the static export, then
 *   put them back. The web build is never affected.
 *
 * Usage:  npm run build:app
 * Output: /out  (this is what Capacitor wraps)
 */
import { execSync } from "node:child_process";
import { existsSync, renameSync, mkdirSync, rmSync } from "node:fs";
import path from "node:path";

const root = process.cwd();
const stash = path.join(root, ".capacitor-stash");

// [source path, stashed path]
const moves = [
  [path.join(root, "src", "app", "api"), path.join(stash, "api")],
  [path.join(root, "src", "middleware.ts"), path.join(stash, "middleware.ts")],
  // /auth/callback is a route handler (server-only) — used by the web
  // build for OAuth. The app uses email/password (and, later, native
  // deep-link OAuth), so move it aside for the static export.
  [
    path.join(root, "src", "app", "auth", "callback", "route.ts"),
    path.join(stash, "callback-route.ts"),
  ],
];

function moveAside() {
  if (!existsSync(stash)) mkdirSync(stash, { recursive: true });
  for (const [src, dst] of moves) {
    if (existsSync(src)) {
      renameSync(src, dst);
      console.log("  moved aside:", path.relative(root, src));
    }
  }
}

function restore() {
  for (const [src, dst] of moves) {
    if (existsSync(dst)) {
      renameSync(dst, src);
      console.log("  restored:", path.relative(root, src));
    }
  }
  if (existsSync(stash)) rmSync(stash, { recursive: true, force: true });
}

console.log("→ Preparing static export (moving server-only files aside)…");
moveAside();

try {
  console.log("→ Running next build (BUILD_TARGET=capacitor)…");
  execSync("next build", {
    stdio: "inherit",
    env: { ...process.env, BUILD_TARGET: "capacitor" },
  });
  console.log("✅ Static export complete → ./out");
} catch (e) {
  console.error("❌ Build failed:", e?.message || e);
  process.exitCode = 1;
} finally {
  console.log("→ Restoring server-only files…");
  restore();
  console.log("✅ Done. Server-only files are back in place.");
}
