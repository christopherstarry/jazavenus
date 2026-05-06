import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { TooltipProvider } from "#/components/ui/tooltip";
import "./index.css";
import { AuthProvider, getAccessToken, setAccessToken, tryRefreshAccessToken } from "#/lib/auth";
import { SettingsProvider } from "#/lib/settings";
import { configureApiAuth, ensureAntiforgery } from "#/lib/api";
import { router } from "#/app/router";

const queryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false } },
});

// Bridge the api client to the auth module before the very first network call so 401s are
// transparently retried via /api/auth/refresh and stale bearer tokens are dropped on logout.
configureApiAuth({
  getBearer: getAccessToken,
  refresh: tryRefreshAccessToken,
  onUnauthorized: () => setAccessToken(null),
});

if (import.meta.env.VITE_SKIP_ANTIFORGERY !== "true") {
  await ensureAntiforgery().catch(() => { /* Backend may be cold-starting; AuthProvider retries. */ });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <AuthProvider>
      <SettingsProvider>
        <TooltipProvider delayDuration={150}>
          <QueryClientProvider client={queryClient}>
            <RouterProvider router={router} />
          </QueryClientProvider>
        </TooltipProvider>
      </SettingsProvider>
    </AuthProvider>
  </StrictMode>
);
