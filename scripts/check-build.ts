/**
 * Check whether the dist build is up to date with the src files.
 * If any src *.ts file is newer than dist/index.mjs, trigger a build.
 * Otherwise, skip the build and print a message.
 */
import { execSync } from "node:child_process";
import { type Dirent, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

const DIST_SENTINEL = "dist/index.mjs";
const SRC_DIR = "src";

let distMtime = 0;
try {
  distMtime = statSync(DIST_SENTINEL).mtimeMs;
} catch {
  // dist doesn't exist yet
}

const srcFiles: string[] = readdirSync(SRC_DIR, { withFileTypes: true, recursive: true })
  .filter((entry: Dirent) => entry.isFile() && entry.name.endsWith(".ts"))
  .map((entry: Dirent) => join(entry.parentPath, entry.name));

const stale: boolean = distMtime === 0 || srcFiles.some((file: string) => statSync(file).mtimeMs > distMtime);

if (stale) {
  console.log("Build is out of date — rebuilding...");
  execSync("pnpm run build", { stdio: "inherit" });
} else {
  console.log("Build is up to date — skipping build.");
}
