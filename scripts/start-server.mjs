import { spawn } from "node:child_process";
import { openSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
const project = fileURLToPath(new URL("..", import.meta.url));
if (!existsSync(resolve(project, "dist/index.html")))
  throw new Error("Run npm run build first.");
try {
  const response = await fetch("http://127.0.0.1:5207/");
  if (response.ok)
    throw new Error(
      "Port 5207 is already serving a page. Do not start a duplicate.",
    );
} catch (error) {
  if (error.message.includes("already serving")) throw error;
}
const log = openSync(resolve(project, "server.log"), "a");
const child = spawn(
  process.execPath,
  [
    resolve(project, "node_modules/vite/bin/vite.js"),
    "preview",
    "--host",
    "127.0.0.1",
    "--port",
    "5207",
    "--strictPort",
  ],
  { cwd: project, detached: true, stdio: ["ignore", log, log] },
);
child.unref();
for (let i = 0; i < 30; i++) {
  await new Promise((r) => setTimeout(r, 100));
  try {
    const response = await fetch("http://127.0.0.1:5207/");
    if (response.ok) {
      console.log(
        `Stillwater: http://127.0.0.1:5207/ (detached PID ${child.pid}). Log: ${resolve(project, "server.log")}`,
      );
      process.exit(0);
    }
  } catch {}
}
throw new Error("Server failed to become ready; inspect server.log.");
