import { useState, type ReactNode, type ComponentType } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Inbox } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { api } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Kbd } from "@/components/ui/kbd";

export interface PagedResult<T> { items: T[]; totalCount: number; page: number; pageSize: number; totalPages: number; }

interface CrudPageProps<T> {
  title: string;
  description?: string;
  endpoint: string;
  columns: { key: keyof T | string; label: string; align?: "left" | "right"; render?: (row: T) => ReactNode }[];
  searchable?: boolean;
  searchPlaceholder?: string;
  rightSlot?: ReactNode;
  /** Empty-state config when there are no results AND no search query. */
  empty?: { icon?: LucideIcon | ComponentType<{ className?: string }>; title: string; description: string; action?: ReactNode };
}

export function CrudPage<T extends { id: string }>({
  title, description, endpoint, columns,
  searchable = true, searchPlaceholder = "Search by name or code…",
  rightSlot, empty,
}: CrudPageProps<T>) {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState("");

  const q = useQuery({
    queryKey: [endpoint, page, pageSize, search],
    queryFn: () =>
      api
        .get(endpoint, { searchParams: { page, pageSize, ...(search ? { search } : {}) } })
        .json<PagedResult<T>>(),
  });

  const isEmpty = q.data && q.data.items.length === 0 && !search;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 lg:shrink-0">
            {searchable && (
              <div className="relative w-full sm:w-72 sm:max-w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground pointer-events-none" />
                <Input
                  type="search"
                  placeholder={searchPlaceholder}
                  value={search}
                  onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                  className="pl-11 pr-12 w-full"
                  aria-label="Search"
                />
                {!search && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 hidden md:flex items-center gap-1 text-xs text-muted-foreground">
                    <Kbd>/</Kbd>
                  </span>
                )}
              </div>
            )}
            {rightSlot && (
              <div className="flex flex-wrap items-center gap-2 sm:gap-3">{rightSlot}</div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {q.isLoading && (
          <div className="py-10 flex justify-center"><Spinner label="Loading…" /></div>
        )}

        {!q.isLoading && isEmpty && empty && (
          <EmptyState
            icon={empty.icon ?? Inbox}
            title={empty.title}
            description={empty.description}
            action={empty.action}
          />
        )}

        {!q.isLoading && (!isEmpty || !empty) && (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  {columns.map((c) => (
                    <TableHead key={String(c.key)} className={c.align === "right" ? "text-right" : ""}>{c.label}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {q.data?.items.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((c) => (
                      <TableCell key={String(c.key)} className={c.align === "right" ? "text-right tabular-nums" : ""}>
                        {c.render ? c.render(row) : (row[c.key as keyof T] as ReactNode)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {q.data && q.data.items.length === 0 && search && (
                  <TableRow>
                    <TableCell colSpan={columns.length} className="text-center text-muted-foreground py-10">
                      No results match "<span className="font-semibold text-foreground">{search}</span>". Try different words.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>

            {q.data && q.data.totalPages > 1 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <span className="text-sm sm:text-base text-muted-foreground">
                  Page {q.data.page} of {q.data.totalPages}
                  <span className="hidden sm:inline"> — {q.data.totalCount.toLocaleString()} records total</span>
                </span>
                <div className="flex gap-2 self-end sm:self-auto">
                  <Button variant="outline" size="sm" className="sm:!h-12 sm:!text-base" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                    <ChevronLeft className="h-5 w-5 sm:mr-1" /> <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <Button variant="outline" size="sm" className="sm:!h-12 sm:!text-base" disabled={page >= q.data.totalPages} onClick={() => setPage((p) => p + 1)}>
                    <span className="hidden sm:inline">Next</span> <ChevronRight className="h-5 w-5 sm:ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
