import { useCallback, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef, type Row } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";
import { cn } from "#/lib/utils";
import { Button } from "#/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";

declare module "@tanstack/react-table" {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface TableMeta<TData> {
    onItemLookup?: (rowIndex: number) => void;
  }
}

export type RowStatus = "unchanged" | "insert" | "update" | "delete";

export interface EditableLineRow {
  id?: string;
  lineNumber: number;
  _status: RowStatus;
}

export interface EditableLineGridProps<T extends EditableLineRow> {
  columns: ColumnDef<T>[];
  rows: T[];
  onRowsChange: (rows: T[]) => void;
  readOnly?: boolean;
  /** Row-index-aware factory for a brand-new line (used by Insert key + auto-add-on-focus). */
  makeEmptyRow: (lineNumber: number) => T;
  /** Opens the item lookup for a given row index (magnifier overlay on the Item cell). */
  onItemLookup?: (rowIndex: number) => void;
  className?: string;
}

/**
 * Legacy line-item grid (`VSFlexGrid` + `GridModul.bas`): insert/update/delete row status with
 * blue/red styling, Insert/Delete/Enter keyboard, auto-add empty row. See
 * docs/modules/shared/ui-foundation/editable-grid-pattern.md. Rows marked `delete` are excluded
 * from the API payload by the caller on save (see `visibleForSubmit`).
 */
export function EditableLineGrid<T extends EditableLineRow>({
  columns,
  rows,
  onRowsChange,
  readOnly,
  makeEmptyRow,
  onItemLookup,
  className,
}: EditableLineGridProps<T>) {
  const { t } = useTranslation("grid");
  const containerRef = useRef<HTMLDivElement>(null);

  const activeRows = useMemo(() => rows, [rows]);

  const allColumns = useMemo<ColumnDef<T>[]>(() => {
    if (readOnly) return columns;
    return [
      ...columns,
      {
        id: "_actions",
        header: "",
        cell: ({ row }: { row: Row<T> }) => (
          <Button
            type="button"
            variant="ghost"
            size="iconsm"
            aria-label={t("delete")}
            onClick={() => handleDeleteRow(row.index)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        ),
      },
    ];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, readOnly]);

  const table = useReactTable({
    data: activeRows,
    columns: allColumns,
    getCoreRowModel: getCoreRowModel(),
    getRowId: (row, index) => row.id ?? `new-${index}`,
    meta: { onItemLookup },
  });

  const addRow = useCallback(() => {
    const nextLineNumber = activeRows.length > 0 ? Math.max(...activeRows.map((r) => r.lineNumber)) + 1 : 1;
    onRowsChange([...activeRows, makeEmptyRow(nextLineNumber)]);
  }, [activeRows, onRowsChange, makeEmptyRow]);

  const handleDeleteRow = useCallback(
    (index: number) => {
      const row = activeRows[index];
      if (!row) return;
      if (row._status === "insert") {
        onRowsChange(activeRows.filter((_, i) => i !== index));
      } else {
        const next = [...activeRows];
        next[index] = { ...row, _status: "delete" };
        onRowsChange(next);
      }
    },
    [activeRows, onRowsChange],
  );

  const handleFocus = useCallback(() => {
    if (readOnly) return;
    if (activeRows.length === 0) addRow();
  }, [activeRows.length, addRow, readOnly]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (readOnly) return;
      if (e.key === "Insert") {
        e.preventDefault();
        addRow();
      } else if (e.key === "Enter") {
        // Legacy GoToNextColumn: move focus to the next editable cell in the same row.
        const target = e.target as HTMLElement;
        const cell = target.closest("td");
        const nextCell = cell?.nextElementSibling as HTMLElement | null;
        const nextInput = nextCell?.querySelector<HTMLElement>("input, select, button");
        if (nextInput) {
          e.preventDefault();
          nextInput.focus();
        }
      }
    },
    [addRow, readOnly],
  );

  const rowClass = (status: RowStatus) =>
    cn(
      status === "update" && "text-blue-600 dark:text-blue-400",
      status === "delete" && "text-red-600 dark:text-red-400 line-through",
    );

  return (
    <div ref={containerRef} onFocus={handleFocus} onKeyDown={handleKeyDown} className={className}>
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((hg) => (
            <TableRow key={hg.id}>
              {hg.headers.map((h) => (
                <TableHead key={h.id}>{flexRender(h.column.columnDef.header, h.getContext())}</TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={allColumns.length} className="text-center text-muted-foreground py-8">
                {t("noLines")}
              </TableCell>
            </TableRow>
          ) : (
            table.getRowModel().rows.map((row) => (
              <TableRow key={row.id} className={rowClass(row.original._status)}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      {!readOnly && (
        <Button type="button" variant="outline" size="sm" className="mt-2" onClick={addRow}>
          {t("addLine")}
        </Button>
      )}
    </div>
  );
}

/** Excludes delete-marked rows and strips `_status`/omits `id` for inserts before an API POST/PUT. */
export function toSubmitLines<T extends EditableLineRow>(rows: T[]): Omit<T, "_status">[] {
  return rows
    .filter((r) => r._status !== "delete")
    .map(({ _status, ...rest }) => rest as Omit<T, "_status">);
}
