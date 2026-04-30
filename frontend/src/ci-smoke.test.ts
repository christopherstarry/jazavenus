import { describe, it, expect } from "vitest";
import { DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE } from "#/lib/paging";

/**
 * Ultra-light smoke test so CI proves the Vitest harness ran.
 * (We also have fuller tests under `src/app/*.test.ts`.)
 */
describe("CI smoke", () => {
  it("runs the test runner", () => {
    expect(1 + 1).toBe(2);
  });

  it("frontend paging constants match backend PagedRequest contract", () => {
    expect(DEFAULT_PAGE_SIZE).toBe(20);
    expect(MAX_PAGE_SIZE).toBe(50);
  });
});
