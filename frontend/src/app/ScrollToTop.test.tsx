import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Link, MemoryRouter, Route, Routes } from "react-router";
import { ScrollToTop } from "./ScrollToTop";

/**
 * The router doesn't restore scroll between routes by itself. ScrollToTop
 * forcibly scrolls to (0, 0) when the pathname changes, so users always
 * land on the top of a freshly opened screen.
 */
describe("ScrollToTop", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
  });

  it("scrolls to top on initial mount", () => {
    render(
      <MemoryRouter initialEntries={["/some-page"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/some-page" element={<div>page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });

  it("scrolls to top again when the pathname changes", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter initialEntries={["/a"]}>
        <ScrollToTop />
        <Routes>
          <Route path="/a" element={<Link to="/b">Go B</Link>} />
          <Route path="/b" element={<div>B</div>} />
        </Routes>
      </MemoryRouter>,
    );

    /* One call from the initial mount on /a */
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    (window.scrollTo as ReturnType<typeof vi.fn>).mockClear();

    await user.click(screen.getByRole("link", { name: "Go B" }));

    /* Navigation to /b should fire the effect again */
    expect(window.scrollTo).toHaveBeenCalledTimes(1);
    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: "auto" });
  });
});
