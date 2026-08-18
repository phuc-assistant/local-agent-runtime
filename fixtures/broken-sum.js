// DELIBERATELY WRONG fixture for the stub-agent demo. Not a library.
// sum(2, 3) returns -1 (subtracts) so a later write_file can prove a real fix.

export function sum(a, b) {
  return a - b;
}

export function sumAll(xs) {
  let total = 0;
  for (const n of xs) total -= n;
  return total;
}
