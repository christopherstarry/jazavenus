import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth, hasRole, type CurrentUser } from "#/lib/auth";
import { Button } from "#/components/ui/button";
import { Badge } from "#/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "#/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "#/components/ui/popover";
import { Breadcrumbs } from "#/components/ui/breadcrumbs";
import {
  LogOut, Settings, Menu, ChevronDown, KeyRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "#/lib/utils";
import { TREE, findModuleByPath, trailFor, type ModuleNode } from "#/app/modules";
import { ScrollToTop } from "#/app/ScrollToTop";

/* "Maria Da Silva" → "MD". Falls back to username or email. */
function getInitials(user: CurrentUser): string {
  const fromName = user.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
  if (fromName) return fromName;
  if (user.username) return user.username.slice(0, 2).toUpperCase();
  return user.email.slice(0, 2).toUpperCase();
}

function displayAccountSubtitle(user: CurrentUser): string {
  return user.username?.trim() || user.email.trim() || "—";
}

export function AppLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const trail = trailFor(location.pathname);
  const current = trail[trail.length - 1] ?? findModuleByPath(location.pathname);

  /* Auto-close the mobile drawer when the user picks an item. */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* Pressing '/' jumps to the search input on the current page if there is one. */
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "/" && !(e.target instanceof HTMLInputElement) && !(e.target instanceof HTMLTextAreaElement)) {
        const search = document.querySelector<HTMLInputElement>('input[type="search"]');
        if (search) { e.preventDefault(); search.focus(); }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const today = new Date().toLocaleDateString(undefined, {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });
  const todayShort = new Date().toLocaleDateString(undefined, {
    month: "short", day: "numeric",
  });

  /** Nav items only — branding lives in the desktop header grid so bottom borders align across columns. */
  const sidebarNav = (
    <SidebarNavigation user={user} activeSectionId={trail[0]?.id} />
  );

  /** Full drawer chrome (brand + nav) — used in the mobile sheet only. */
  const sidebarDrawer = (
    <SidebarDrawerBody user={user} activeSectionId={trail[0]?.id} />
  );

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <ScrollToTop />

      {/*
        Desktop (lg+): one full-width sticky row — [ branding | breadcrumbs + title ] — with a single
        bottom border. The first column matches the sidebar width below (18rem / 20rem).

        Mobile: branding is hidden here; logo lives in the drawer. Title row stacks as one column.
      */}
      <header className="sticky top-0 z-20 shrink-0 bg-background/95 backdrop-blur border-b-2 lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] xl:grid-cols-[20rem_minmax(0,1fr)]">
        <div className="hidden lg:flex lg:items-center border-r-2 border-border bg-card px-5 sm:px-6 py-3 sm:py-4">
          <SidebarBranding />
        </div>

        <div className="min-w-0">
          <div className="px-3 sm:px-5 md:px-8 max-w-7xl mx-auto w-full">
            {current && current.path !== "/" && (
              <div className="pt-2 sm:pt-3">
                <Breadcrumbs trail={trail} />
              </div>
            )}

            <div className="py-3 sm:py-4 flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden shrink-0"
                onClick={() => setMobileOpen(true)}
                aria-label="Open menu"
              >
                <Menu className="h-6 w-6" />
              </Button>

              <h1 className="flex-1 min-w-0 text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
                {current?.label ?? "Jaza Venus"}
              </h1>

              <div className="text-right shrink-0 hidden md:block">
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Today</div>
                <div className="text-sm md:text-base font-semibold whitespace-nowrap">
                  <span className="lg:hidden">{todayShort}</span>
                  <span className="hidden lg:inline">{today}</span>
                </div>
              </div>

              {user && (
                <UserMenu
                  user={user}
                  onSettings={() => navigate("/settings")}
                  onChangePassword={() => navigate("/system/change-password")}
                  onLogout={() => void logout()}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 min-w-0 lg:flex-row">
        {/* Desktop sidebar — nav only; aligns under header brand column */}
        <aside className="hidden lg:flex lg:w-72 xl:w-80 shrink-0 border-r-2 bg-card flex-col min-h-0">
          {sidebarNav}
        </aside>

        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetContent side="left" className="p-0">
            <SheetTitle className="sr-only">Navigation menu</SheetTitle>
            <SheetDescription className="sr-only">Browse the app sections.</SheetDescription>
            {sidebarDrawer}
          </SheetContent>
        </Sheet>

        <main className="flex-1 min-w-0 flex min-h-0 flex-col overflow-y-auto overscroll-contain">
          <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto w-full flex-1 min-h-0">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * User menu (top-right avatar)
 * ───────────────────────────────────────────────────────────────────────── */

function UserMenu({
  user, onSettings, onChangePassword, onLogout,
}: {
  user: CurrentUser;
  onSettings: () => void;
  onChangePassword: () => void;
  onLogout: () => void;
}) {
  const [open, setOpen] = useState(false);
  const initials = getInitials(user);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label={`Account menu — ${user.fullName}`}
          title={user.fullName}
          className={cn(
            "shrink-0 inline-flex items-center justify-center rounded-full",
            "h-11 w-11 sm:h-12 sm:w-12",
            "bg-primary text-primary-foreground font-bold text-base shadow-sm",
            "hover:bg-primary/90 transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          )}
        >
          {initials}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" sideOffset={10} className="w-72 p-0 overflow-hidden">
        <div className="px-4 py-4 border-b-2">
          <div className="flex items-center gap-3">
            <span
              aria-hidden
              className="shrink-0 inline-flex items-center justify-center h-12 w-12 rounded-full bg-primary text-primary-foreground font-bold"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <div className="font-semibold text-base truncate">{user.fullName}</div>
              <div className="text-sm text-muted-foreground truncate">{displayAccountSubtitle(user)}</div>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {user.roles.map((r) => (
              <Badge key={r} tone={r === "SuperAdmin" ? "info" : "neutral"}>{r}</Badge>
            ))}
          </div>
        </div>
        <div className="p-2">
          <UserMenuItem icon={KeyRound} label="Change password" onClick={() => { setOpen(false); onChangePassword(); }} />
          <UserMenuItem icon={Settings} label="Settings"        onClick={() => { setOpen(false); onSettings(); }} />
          <UserMenuItem icon={LogOut}   label="Sign out"        onClick={() => { setOpen(false); onLogout(); }} tone="destructive" />
        </div>
      </PopoverContent>
    </Popover>
  );
}

function UserMenuItem({
  icon: Icon, label, onClick, tone,
}: { icon: LucideIcon; label: string; onClick: () => void; tone?: "destructive" }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 rounded-md px-3 py-3 text-base text-left",
        "hover:bg-accent hover:text-accent-foreground transition-colors",
        "focus-visible:outline-none focus-visible:bg-accent focus-visible:text-accent-foreground",
        tone === "destructive" && "text-destructive hover:bg-destructive/10 hover:text-destructive focus-visible:bg-destructive/10 focus-visible:text-destructive"
      )}
    >
      <Icon className="h-5 w-5" />
      <span className="font-medium">{label}</span>
    </button>
  );
}

/* ─────────────────────────────────────────────────────────────────────────────
 * Sidebar
 * ───────────────────────────────────────────────────────────────────────── */

function SidebarBranding() {
  return (
    <NavLink to="/" className="block focus-visible:outline-none focus-visible:underline">
      <div className="text-2xl font-bold tracking-tight">Jaza Venus</div>
      <div className="text-sm text-muted-foreground">Warehouse Management</div>
    </NavLink>
  );
}

/** Nav list only — used in desktop `aside` and inside the mobile drawer. */
function SidebarNavigation({ user, activeSectionId }: { user: CurrentUser | null; activeSectionId?: string }) {
  /* Sidebar order:
   *   1. Dashboard (top)
   *   2. The day-to-day work areas (Master, Purchase, Sales, A/R, Inventory, Report, Tax)
   *   3. System (very bottom — admin/utility area, not part of the daily flow)
   *   "settings" is reachable from the user menu only, so we skip it here. */
  const dashboard = TREE.find((n) => n.id === "dashboard");
  const system    = TREE.find((n) => n.id === "system");
  const main      = TREE.filter((n) => n.path !== "/" && n.id !== "settings" && n.id !== "system");

  return (
    <nav className="flex flex-col gap-4 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4 min-h-0" aria-label="Main navigation">
        {/* Dashboard always visible at the top */}
        {dashboard && (
          <ul className="flex flex-col gap-1">
            <li>
              <SectionHeader
                node={dashboard}
                active={activeSectionId === "dashboard"}
                hasChildren={false}
                expanded={false}
                onToggle={() => {}}
              />
            </li>
          </ul>
        )}

        {/* Main day-to-day sections */}
        <ul className="flex flex-col gap-1">
          {main
            .filter((s) => !s.superAdminOnly || hasRole(user, "SuperAdmin"))
            .map((section) => (
              <SidebarSection
                key={section.id}
                section={section}
                user={user}
                isActive={activeSectionId === section.id}
              />
            ))}
        </ul>

        {/* System pinned to the bottom — admin/utility tools */}
        {system && (!system.superAdminOnly || hasRole(user, "SuperAdmin")) && (
          <ul className="mt-auto flex flex-col gap-1 pt-3 border-t-2 border-border/60">
            <SidebarSection
              section={system}
              user={user}
              isActive={activeSectionId === "system"}
            />
          </ul>
        )}
    </nav>
  );
}

/** Mobile sheet: brand strip + nav (each has its own border; desktop uses unified header for brand). */
function SidebarDrawerBody({ user, activeSectionId }: { user: CurrentUser | null; activeSectionId?: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b-2 px-5 py-5 sm:px-6 sm:py-6">
        <SidebarBranding />
      </div>
      <SidebarNavigation user={user} activeSectionId={activeSectionId} />
    </div>
  );
}

/** A top-level section in the sidebar — collapsible, auto-expands when active. */
function SidebarSection({
  section, user, isActive,
}: { section: ModuleNode; user: CurrentUser | null; isActive: boolean }) {
  const [manuallyExpanded, setManuallyExpanded] = useState<boolean | null>(null);
  const expanded = manuallyExpanded ?? isActive;

  /* When you navigate INTO a section, auto-expand. (User can still collapse manually.) */
  useEffect(() => {
    if (isActive) setManuallyExpanded(null);
  }, [isActive]);

  const visibleChildren = (section.children ?? []).filter(
    (c) => !c.superAdminOnly || hasRole(user, "SuperAdmin"),
  );
  const hasChildren = visibleChildren.length > 0;

  return (
    <li>
      <SectionHeader
        node={section}
        active={isActive}
        hasChildren={hasChildren}
        expanded={expanded}
        onToggle={() => setManuallyExpanded(!expanded)}
      />
      {hasChildren && expanded && (
        <ul className="mt-1 pl-2 ml-3 border-l-2 border-border flex flex-col gap-0.5">
          {visibleChildren.map((child, idx) => (
            <li key={child.id}>
              {child.divider && idx > 0 && (
                <div role="separator" className="my-2 mx-2 border-t border-dashed border-border" />
              )}
              <NavLink
                to={child.path}
                end={!child.children || child.children.length === 0 || child.childLayout === "tabs"}
                className={({ isActive }) =>
                  cn(
                    "block rounded-[var(--radius)] px-3 py-2.5 text-base min-h-[2.75rem]",
                    "leading-snug transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "text-foreground hover:bg-accent",
                  )
                }
              >
                {child.label}
              </NavLink>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
}

/** A section header row (icon + label + chevron). Doubles as the dashboard tile. */
function SectionHeader({
  node, active, hasChildren, expanded, onToggle,
}: {
  node: ModuleNode;
  active: boolean;
  hasChildren: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const Icon = node.icon;

  /* If this section has no children we render a NavLink that just navigates;
     otherwise we render a row with two buttons: NavLink to /section and a
     toggle button to expand/collapse. */
  if (!hasChildren) {
    return (
      <NavLink
        to={node.path}
        end={node.path === "/"}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-[var(--radius)] px-3 py-3 min-h-[3rem] transition-colors",
            isActive ? "bg-primary text-primary-foreground shadow-sm" : "text-foreground hover:bg-accent",
          )
        }
      >
        {Icon && <Icon className="h-5 w-5 shrink-0" aria-hidden />}
        <span className="font-semibold text-base truncate">{node.label}</span>
      </NavLink>
    );
  }

  return (
    <div
      className={cn(
        "flex items-center rounded-[var(--radius)] transition-colors",
        active ? "bg-primary/10" : "hover:bg-accent",
      )}
    >
      <NavLink
        to={node.path}
        className={cn(
          "flex flex-1 items-center gap-3 px-3 py-3 min-h-[3rem] rounded-[var(--radius)] focus-visible:outline-none focus-visible:bg-accent",
        )}
      >
        {Icon && <Icon className={cn("h-5 w-5 shrink-0", active && "text-primary")} aria-hidden />}
        <span className={cn("font-semibold text-base truncate", active && "text-primary")}>
          {node.label}
        </span>
      </NavLink>
      <button
        type="button"
        onClick={onToggle}
        aria-label={expanded ? `Collapse ${node.label}` : `Expand ${node.label}`}
        aria-expanded={expanded}
        className="inline-flex h-10 w-10 items-center justify-center rounded-md text-muted-foreground hover:bg-accent/80 hover:text-foreground focus-visible:outline-none focus-visible:bg-accent"
      >
        <ChevronDown className={cn("h-5 w-5 transition-transform", expanded && "rotate-180")} />
      </button>
    </div>
  );
}
