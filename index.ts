import concurrently from "concurrently";

concurrently([
  { command: "bun run apps/server/index.ts", name: "server", cwd: "apps/server", prefixColor: "cyan" },
  { command: "bun run apps/pwa/index.ts", name: "pwa", cwd: "apps/pwa", prefixColor: "green" },
]);