import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { TooltipProvider } from "#/components/ui/tooltip";
import "./index.css";
import { AuthProvider } from "#/lib/auth";
import { SettingsProvider } from "#/lib/settings";
import { ensureAntiforgery } from "#/lib/api";
import { router } from "#/app/router";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

if (import.meta.env.VITE_SKIP_ANTIFORGERY !== "true") {
  await ensureAntiforgery().catch(() => { /* Backend optional */ });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SettingsProvider>
      <TooltipProvider delayDuration={150}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>
            <RouterProvider router={router} />
          </AuthProvider>
        </QueryClientProvider>
      </TooltipProvider>
    </SettingsProvider>
  </StrictMode>
);
