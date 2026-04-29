import { useEffect, useMemo, useState } from "react";
import { MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";

const DIVISION_LABEL = "JAZA VENUS DISTRIBUTION BANDUNG";

const CLASS_OUTLET_POC = [
  { groupOutlet: "04", description: "< 250.000" },
  { groupOutlet: "01", description: ">= 1 JT  - < 5 JT" },
  { groupOutlet: "03", description: ">= 250.000 - < 500.000" },
  { groupOutlet: "02", description: ">= 500.000 - < 1 JT" },
] as const;

export function ClassOutletPage() {
  const [groupOutlet, setGroupOutlet] = useState("");
  const [description, setDescription] = useState("");
  const [lookupOpen, setLookupOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="rounded-md border-2 bg-card px-4 py-3 text-base sm:text-lg font-bold tracking-wide text-center uppercase">
        Division&nbsp;: {DIVISION_LABEL}
      </div>

      <div className="rounded-md border-2 border-border p-4 space-y-4">
        <h2 className="text-xl font-bold tracking-tight">:: Table of Class Outlet</h2>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="class-outlet-code">Group Outlet</Label>
            <div className="flex gap-2 max-w-sm">
              <Input
                id="class-outlet-code"
                value={groupOutlet}
                onChange={(e) => setGroupOutlet(e.target.value)}
                placeholder="01"
                autoComplete="off"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-12 w-12 shrink-0"
                onClick={() => setLookupOpen(true)}
                title="Open class outlet list"
              >
                <MoreHorizontal className="h-5 w-5" />
                <span className="sr-only">Open list</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="class-outlet-description">Description</Label>
            <Input
              id="class-outlet-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Outlet class description"
            />
          </div>
        </div>
      </div>

      <ClassOutletLookupDialog
        open={lookupOpen}
        onOpenChange={setLookupOpen}
        onSelect={(row) => {
          setGroupOutlet(row.groupOutlet);
          setDescription(row.description);
        }}
      />
    </div>
  );
}

function ClassOutletLookupDialog({
  open,
  onOpenChange,
  onSelect,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (row: { groupOutlet: string; description: string }) => void;
}) {
  const [filterText, setFilterText] = useState("");
  const [selectedIdx, setSelectedIdx] = useState(0);

  useEffect(() => {
    if (open) {
      setFilterText("");
      setSelectedIdx(0);
    }
  }, [open]);

  const rows = useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return [...CLASS_OUTLET_POC];
    return CLASS_OUTLET_POC.filter((row) => row.description.toLowerCase().includes(q));
  }, [filterText]);

  useEffect(() => {
    if (selectedIdx >= rows.length) setSelectedIdx(Math.max(0, rows.length - 1));
  }, [rows.length, selectedIdx]);

  const applySelection = () => {
    const row = rows[selectedIdx];
    if (row) onSelect({ groupOutlet: row.groupOutlet, description: row.description });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[min(100vw-1.5rem,42rem)] p-4 sm:p-5 gap-0 border-2 max-h-[min(92vh,38rem)] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 pb-2 pr-10">
          <DialogTitle className="text-base font-bold sr-only">Class outlet lookup</DialogTitle>
          <p className="text-base font-bold">Table of Class Outlet</p>
        </DialogHeader>

        <div className="shrink-0 rounded-md border-2 bg-muted/30 px-4 py-3 space-y-3">
          <div className="text-sm font-bold text-muted-foreground uppercase tracking-wide">Criteria</div>
          <div className="flex flex-wrap items-end gap-3">
            <div className="space-y-1.5 min-w-[9rem]">
              <Label className="text-xs uppercase tracking-wide">Field</Label>
              <select
                disabled
                className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium opacity-80"
              >
                <option>Description</option>
              </select>
            </div>
            <div className="space-y-1.5 min-w-[9rem]">
              <Label className="text-xs uppercase tracking-wide">Match</Label>
              <select
                disabled
                className="flex h-11 w-full rounded-[var(--radius)] border-2 border-input bg-background px-3 text-base font-medium opacity-80"
              >
                <option>Contains</option>
              </select>
            </div>
            <Button type="button" variant="outline" size="sm" className="h-11" disabled>
              Find
            </Button>
            <label className="inline-flex items-center gap-2 min-h-[2.75rem]">
              <input type="checkbox" checked readOnly className="h-5 w-5 rounded border-2 border-input accent-primary" />
              <span className="font-semibold text-base">Auto Search</span>
            </label>
          </div>
          <Input
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            placeholder="Type to narrow the list..."
            className="h-11"
          />
        </div>

        <div className="min-h-0 flex-1 flex flex-col border-2 rounded-md overflow-hidden mt-3 border-border">
          <div className="overflow-auto max-h-[min(52vh,18rem)]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Description</TableHead>
                  <TableHead>Group Outlet</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((row, idx) => {
                  const stableKey = `${row.groupOutlet}\0${row.description}`;
                  return (
                    <TableRow
                      key={stableKey}
                      data-state={selectedIdx === idx ? "selected" : undefined}
                      role="button"
                      tabIndex={0}
                      className={cn("cursor-pointer", selectedIdx === idx && "bg-accent")}
                      onClick={() => setSelectedIdx(idx)}
                      onDoubleClick={() => {
                        onSelect({ groupOutlet: row.groupOutlet, description: row.description });
                        onOpenChange(false);
                      }}
                    >
                      <TableCell className="py-3">{row.description}</TableCell>
                      <TableCell className="py-3 tabular-nums">{row.groupOutlet}</TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </div>

        <DialogFooter className="shrink-0 gap-3 sm:justify-end sm:items-center pt-4 border-t-2 mt-3">
          <Button type="button" variant="outline" size="lg" className="min-w-[8rem]" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" size="lg" className="min-w-[8rem]" onClick={applySelection} disabled={rows.length === 0}>
            OK
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
