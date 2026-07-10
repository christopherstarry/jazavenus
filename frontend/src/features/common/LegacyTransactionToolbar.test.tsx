import { renderHook } from "@testing-library/react";
import { fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useLegacyShortcuts } from "./LegacyTransactionToolbar";

describe("useLegacyShortcuts", () => {
  it("dispatches F1-F5 and Esc to the matching handler", () => {
    const onNew = vi.fn();
    const onSave = vi.fn();
    const onUndo = vi.fn();
    const onBrowse = vi.fn();
    const onExecute = vi.fn();
    const onClose = vi.fn();

    renderHook(() => useLegacyShortcuts({ onNew, onSave, onUndo, onBrowse, onExecute, onClose }));

    fireEvent.keyDown(window, { key: "F1" });
    fireEvent.keyDown(window, { key: "F2" });
    fireEvent.keyDown(window, { key: "F3" });
    fireEvent.keyDown(window, { key: "F4" });
    fireEvent.keyDown(window, { key: "F5" });
    fireEvent.keyDown(window, { key: "Escape" });

    expect(onNew).toHaveBeenCalledTimes(1);
    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onUndo).toHaveBeenCalledTimes(1);
    expect(onBrowse).toHaveBeenCalledTimes(1);
    expect(onExecute).toHaveBeenCalledTimes(1);
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("falls back F3 to onDelete when onUndo is not provided", () => {
    const onDelete = vi.fn();
    renderHook(() => useLegacyShortcuts({ onDelete }));
    fireEvent.keyDown(window, { key: "F3" });
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it("does nothing when enabled is false", () => {
    const onNew = vi.fn();
    renderHook(() => useLegacyShortcuts({ onNew, enabled: false }));
    fireEvent.keyDown(window, { key: "F1" });
    expect(onNew).not.toHaveBeenCalled();
  });
});
