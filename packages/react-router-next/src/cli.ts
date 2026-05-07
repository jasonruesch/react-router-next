#!/usr/bin/env node
import { generateRouteTypes } from "./plugin/typegen";

type ParsedArgs = {
  command: string | undefined;
  flags: Record<string, string | true>;
  rest: string[];
};

function parseArgs(argv: string[]): ParsedArgs {
  const flags: Record<string, string | true> = {};
  const rest: string[] = [];
  let command: string | undefined;
  for (const arg of argv) {
    if (arg.startsWith("--")) {
      const eq = arg.indexOf("=");
      if (eq === -1) {
        flags[arg.slice(2)] = true;
      } else {
        flags[arg.slice(2, eq)] = arg.slice(eq + 1);
      }
    } else if (!command) {
      command = arg;
    } else {
      rest.push(arg);
    }
  }
  return { command, flags, rest };
}

function printHelp(): void {
  console.log(`react-router-next — typed filesystem routing for React Router 7

Usage:
  react-router-next typegen [options]

Options:
  --app-dir <path>   Source directory of pages/layouts (default: src/app)
  --out-dir <path>   Where the routes.d.ts shim is written
                     (default: node_modules/.react-router-next)
  --help, -h         Show this message
`);
}

async function main(): Promise<void> {
  const { command, flags } = parseArgs(process.argv.slice(2));

  if (flags.help || flags.h || command === "help") {
    printHelp();
    return;
  }

  if (command !== "typegen") {
    if (command) {
      console.error(`[react-router-next] Unknown command: ${command}`);
    }
    printHelp();
    process.exit(command ? 1 : 0);
  }

  const result = generateRouteTypes({
    appDir: typeof flags["app-dir"] === "string" ? flags["app-dir"] : undefined,
    outDir: typeof flags["out-dir"] === "string" ? flags["out-dir"] : undefined,
  });

  console.log(
    `[react-router-next] ${result.routeKeys.length} route(s); shim ${
      result.written ? "updated" : "unchanged"
    } at ${result.shimPath}`,
  );
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
