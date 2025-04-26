#!/usr/env/bun
import { $ } from "bun";

await Promise.all([
  $`bun run --watch src/index.tsx | pino-pretty`,
  $`bun run tw:dev`,
]);
