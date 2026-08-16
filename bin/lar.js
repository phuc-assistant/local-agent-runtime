#!/usr/bin/env node
import { main } from "../src/cli.js";

main(process.argv.slice(2)).then((code) => {
  process.exit(typeof code === "number" ? code : 0);
}).catch((err) => {
  const message = err && err.message ? err.message : String(err);
  console.error(message);
  process.exit(typeof err.exitCode === "number" ? err.exitCode : 1);
});
