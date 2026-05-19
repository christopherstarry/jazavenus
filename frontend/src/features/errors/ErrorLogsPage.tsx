import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Search, ChevronLeft, ChevronRight, Bug } from "lucide-react";
import { api } from "#/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "#/components/ui/card";
import { Input } from "#/components/ui/input";
import { Button } from "#/components/ui/button";
import { Spinner } from "#/components/ui/spinner";
import { Badge } from "#/components/ui/badge";
import { EmptyState } from "#/components/ui/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "#/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "#/components/ui/dialog";
import type { PagedResult } from "#/features/common/CrudPage";

interface ErrorLogDto {
  id: string;
  occurredAtUtc: string;
  message: string;
  exceptionType: string | null;
  statusCode: number;
  requestPath: string | null;
  requestMethod: string | null;
  userName: string | null;
  ipAddress: string | null;
  stackTrace: string | null;
}

interface ErrorLogDetailDto extends ErrorLogDto {
  userId: string | null;
  userAgent: string | null;
}

function formatDateTime(utc: string): string {
  const d = new Date(utc);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return `Today ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays === 1) return `Yesterday ${d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
  if (diffDays < 7) return `${diffDays} days ago`;
  return d.toLocaleDateString([], { day: "numeric", month: "short", year: "numeric" });
}

function statusColor(code: number): string {
  if (code >= 500) return "text-red-600 bg-red-50 border-red-200";
  if (code >= 400) return "text-amber-600 bg-amber-50 border-amber-200";
  return "text-blue-600 bg-blue-50 border-blue-200";
}

export function ErrorLogsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [minStatusCode, setMinStatusCode] = useState(500);
  const [selectedLog, setSelectedLog] = useState<ErrorLogDetailDto | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  const q = useQuery({
    queryKey: ["error-logs", page, search, minStatusCode],
    queryFn: async () => {
      const params: Record<string, string | number> = { page, pageSize: 20 };
      if (search) params.search = search;
      params.minStatusCode = minStatusCode;
      return api.get("error-logs", { searchParams: params }).json<PagedResult<ErrorLogDto>>();
    },
    placeholderData: keepPreviousData,
  });

  async function openDetail(log: ErrorLogDto) {
    const detail = await api.get(`error-logs/${log.id}`).json<ErrorLogDetailDto>();
    setSelectedLog(detail);
    setDetailOpen(true);
  }

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-4 flex-wrap">
        <div>
          <CardTitle className="text-2xl">Error Logs</CardTitle>
          {q.data && (
            <p className="text-sm text-muted-foreground mt-1">
              {q.data.totalCount} recorded errors
            </p>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex gap-1 rounded-[var(--radius)] border-2 border-input overflow-hidden">
            {[
              { value: 500, label: "Errors (5xx)" },
              { value: 400, label: "Client (4xx)" },
              { value: 0, label: "All Codes" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => { setMinStatusCode(f.value); setPage(1); }}
                className={`px-3 py-2 text-sm font-medium transition-colors
                  ${minStatusCode === f.value
                    ? "bg-primary text-primary-foreground"
                    : "bg-background text-muted-foreground hover:bg-accent"
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search message, user, or path…"
              className="pl-9"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>
        </div>

        {q.isLoading && (
          <div className="flex justify-center py-12">
            <Spinner label="Loading error logs…" />
          </div>
        )}

        {q.data && q.data.items.length === 0 && (
          <EmptyState icon={Bug} title="No errors" description="No error logs match your filters. The system is running smoothly." />
        )}

        {q.data && q.data.items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[130px]">When</TableHead>
                    <TableHead className="w-[80px]">Status</TableHead>
                    <TableHead className="w-[130px]">Type</TableHead>
                    <TableHead>Message</TableHead>
                    <TableHead className="w-[120px]">Path</TableHead>
                    <TableHead className="w-[100px]">User</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {q.data.items.map((log) => (
                    <TableRow key={log.id} className="hover:bg-muted/50 cursor-pointer" onClick={() => openDetail(log)}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {formatDateTime(log.occurredAtUtc)}
                      </TableCell>
                      <TableCell>
                        <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${statusColor(log.statusCode)}`}>
                          {log.statusCode}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs font-mono truncate max-w-[130px]">
                        {log.exceptionType ? log.exceptionType.split(".").pop() : "—"}
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-md">{log.message}</TableCell>
                      <TableCell className="text-xs font-mono truncate max-w-[120px]">
                        {log.requestMethod && <Badge tone="neutral" className="mr-1 text-[10px]">{log.requestMethod}</Badge>}
                        {log.requestPath ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm truncate max-w-[100px]">{log.userName ?? "—"}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" className="h-8 w-8" title="View details">
                          <Bug className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-4">
              <span className="text-sm text-muted-foreground">
                {q.data.totalCount} entries · Page {q.data.page} of {q.data.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" disabled={page >= q.data.totalPages} onClick={() => setPage((p) => p + 1)}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </>
        )}

        {/* Detail dialog */}
        <Dialog open={detailOpen} onOpenChange={setDetailOpen}>
          <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Error Details</DialogTitle>
              <DialogDescription>Full stack trace and request context</DialogDescription>
            </DialogHeader>
            {selectedLog && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium text-muted-foreground">Status:</span>{" "}
                    <span className={`font-bold ${selectedLog.statusCode >= 500 ? "text-red-600" : "text-amber-600"}`}>
                      {selectedLog.statusCode}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Time:</span>{" "}
                    {new Date(selectedLog.occurredAtUtc).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Type:</span>{" "}
                    <span className="font-mono text-xs">{selectedLog.exceptionType ?? "—"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">Method:</span>{" "}
                    {selectedLog.requestMethod ?? "—"}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-muted-foreground">Path:</span>{" "}
                    <span className="font-mono">{selectedLog.requestPath ?? "—"}</span>
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">User:</span>{" "}
                    {selectedLog.userName ?? "—"}
                  </div>
                  <div>
                    <span className="font-medium text-muted-foreground">IP:</span>{" "}
                    {selectedLog.ipAddress ?? "—"}
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-muted-foreground">User Agent:</span>{" "}
                    <span className="text-xs">{selectedLog.userAgent ?? "—"}</span>
                  </div>
                </div>

                <div>
                  <span className="text-sm font-medium text-muted-foreground">Message:</span>
                  <pre className="mt-1 p-3 rounded-md bg-muted text-sm font-mono whitespace-pre-wrap break-all">
                    {selectedLog.message}
                  </pre>
                </div>

                {selectedLog.stackTrace && (
                  <div>
                    <span className="text-sm font-medium text-muted-foreground">Stack Trace:</span>
                    <pre className="mt-1 p-3 rounded-md bg-muted text-xs font-mono whitespace-pre-wrap break-all max-h-80 overflow-y-auto">
                      {selectedLog.stackTrace}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
