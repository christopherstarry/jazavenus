import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RouterProvider } from "react-router";
import { I18nextProvider } from "react-i18next";
import { TooltipProvider } from "#/components/ui/tooltip";
import { Toaster } from "#/components/ui/toaster";
import "./index.css";
import { AuthProvider, getAccessToken, setAccessToken, tryRefreshAccessToken } from "#/lib/auth";
import { SettingsProvider } from "#/lib/settings";
import { configureApiAuth, ensureAntiforgery } from "#/lib/api";
import { router } from "#/app/router";
import i18n from "#/i18n";

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

await ensureAntiforgery().catch(() => { /* Backend may be cold-starting; AuthProvider retries. */ });

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <AuthProvider>
        <SettingsProvider>
          <TooltipProvider delayDuration={150}>
            <QueryClientProvider client={queryClient}>
              <RouterProvider router={router} />
              <Toaster />
            </QueryClientProvider>
          </TooltipProvider>
        </SettingsProvider>
      </AuthProvider>
    </I18nextProvider>
  </StrictMode>
);
