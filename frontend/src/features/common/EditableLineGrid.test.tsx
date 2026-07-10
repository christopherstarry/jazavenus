import { render, screen, fireEvent } from "@testing-library/react";
import { beforeAll, describe, expect, it, vi } from "vitest";
import type { ColumnDef } from "@tanstack/react-table";
import i18n from "#/i18n";
import { EditableLineGrid, toSubmitLines, type EditableLineRow } from "./EditableLineGrid";

// Assertions below match the English strings for readability; the default "id" locale is
// exercised by the localization sweep in Phase 7, not per-component unit tests.
beforeAll(() => {
  void i18n.changeLanguage("en");
});

interface Line extends EditableLineRow {
  itemCode: string;
  quantity: number;
}

const columns: ColumnDef<Line>[] = [
  { accessorKey: "itemCode", header: "Item" },
  { accessorKey: "quantity", header: "Qty" },
];

function makeEmptyRow(lineNumber: number): Line {
  return { lineNumber, _status: "insert", itemCode: "", quantity: 0 };
}

describe("EditableLineGrid", () => {
  it("shows the empty state and adds a row via the Add Line button", () => {
    const onRowsChange = vi.fn();
    render(<EditableLineGrid columns={columns} rows={[]} onRowsChange={onRowsChange} makeEmptyRow={makeEmptyRow} />);

    expect(screen.getByText(/no lines/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /add line/i }));

    expect(onRowsChange).toHaveBeenCalledWith([{ lineNumber: 1, _status: "insert", itemCode: "", quantity: 0 }]);
  });

  it("marks an existing row as delete rather than removing it", () => {
    const rows: Line[] = [{ id: "abc", lineNumber: 1, _status: "unchanged", itemCode: "SKU1", quantity: 2 }];
    const onRowsChange = vi.fn();
    render(<EditableLineGrid columns={columns} rows={rows} onRowsChange={onRowsChange} makeEmptyRow={makeEmptyRow} />);

    fireEvent.click(screen.getByRole("button", { name: /delete line/i }));

    expect(onRowsChange).toHaveBeenCalledWith([{ ...rows[0], _status: "delete" }]);
  });

  it("removes a brand-new (insert) row outright instead of marking it deleted", () => {
    const rows: Line[] = [{ lineNumber: 1, _status: "insert", itemCode: "", quantity: 0 }];
    const onRowsChange = vi.fn();
    render(<EditableLineGrid columns={columns} rows={rows} onRowsChange={onRowsChange} makeEmptyRow={makeEmptyRow} />);

    fireEvent.click(screen.getByRole("button", { name: /delete line/i }));

    expect(onRowsChange).toHaveBeenCalledWith([]);
  });
});

describe("toSubmitLines", () => {
  it("excludes delete-marked rows and strips _status", () => {
    const rows: Line[] = [
      { id: "1", lineNumber: 1, _status: "unchanged", itemCode: "A", quantity: 1 },
      { id: "2", lineNumber: 2, _status: "delete", itemCode: "B", quantity: 2 },
      { lineNumber: 3, _status: "insert", itemCode: "C", quantity: 3 },
    ];
    expect(toSubmitLines(rows)).toEqual([
      { id: "1", lineNumber: 1, itemCode: "A", quantity: 1 },
      { lineNumber: 3, itemCode: "C", quantity: 3 },
    ]);
  });
});
