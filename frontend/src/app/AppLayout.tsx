import { useEffect, useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth, hasRole, type CurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import {
  LogOut, Settings, Menu, ChevronDown, Clock, KeyRound,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TREE, findModuleByPath, trailFor, type ModuleNode } from "@/app/modules";
import { recordModuleVisit, useRecentModules } from "@/lib/recent-nav";

/* "Maria Da Silva" → "MD". Falls back to email's first 2 letters. */
function getInitials(user: CurrentUser): string {
  const fromName = user.fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase() ?? "")
    .join("");
  if (fromName) return fromName;
  return user.email.slice(0, 2).toUpperCase();
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

  /* Track every visited module so the sidebar's Recent list stays useful. */
  useEffect(() => {
    const m = findModuleByPath(location.pathname);
    if (m) recordModuleVisit(m.id);
  }, [location.pathname]);

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

  const sidebar = <SidebarBody user={user} activeSectionId={trail[0]?.id} />;

  return (
    <div className="min-h-screen bg-muted/30 lg:flex">
      {/* Desktop sidebar — visible at lg+ (1024px+) */}
      <aside className="hidden lg:flex lg:w-72 xl:w-80 shrink-0 border-r-2 bg-card flex-col">
        {sidebar}
      </aside>

      {/* Mobile drawer — slide-in from the left */}
      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetContent side="left" className="p-0">
          <SheetTitle className="sr-only">Navigation menu</SheetTitle>
          <SheetDescription className="sr-only">Browse the app sections.</SheetDescription>
          {sidebar}
        </SheetContent>
      </Sheet>

      <main className="flex-1 min-w-0 flex flex-col">
        <header className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b-2">
          <div className="px-3 sm:px-5 md:px-8 py-3 sm:py-4 max-w-7xl mx-auto flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden shrink-0"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </Button>

            <div className="flex-1 min-w-0">
              <Breadcrumbs trail={trail} className="mb-0.5" />
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight truncate">
                {current?.label ?? "Jaza Venus"}
              </h1>
              {current?.description && (
                <p className="text-sm md:text-base text-muted-foreground mt-0.5 truncate hidden sm:block">
                  {current.description}
                </p>
              )}
            </div>

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
        </header>

        <div className="p-3 sm:p-5 md:p-8 max-w-7xl mx-auto w-full flex-1">
          <Outlet />
        </div>
      </main>
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
              <div className="text-sm text-muted-foreground truncate">{user.email}</div>
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

function SidebarBody({ user, activeSectionId }: { user: CurrentUser | null; activeSectionId?: string }) {
  const recentIds = useRecentModules();

  /* Build a flat lookup once per render so Recent can resolve ids → nodes. */
  const lookup = useMemo(() => {
    const map = new Map<string, ModuleNode>();
    const visit = (n: ModuleNode) => {
      map.set(n.id, n);
      n.children?.forEach(visit);
    };
    TREE.forEach(visit);
    return map;
  }, []);

  /* Top-level sections that should appear in the sidebar (skip dashboard + settings; both are reachable elsewhere). */
  const dashboard = TREE.find((n) => n.id === "dashboard");
  const sections = TREE.filter((n) => n.path !== "/" && n.id !== "settings");

  /* Recent: filter out the current page and resolve to nodes. */
  const recent = recentIds
    .map((id) => lookup.get(id))
    .filter((n): n is ModuleNode => !!n && n.path !== "/")
    .filter((n) => !n.superAdminOnly || hasRole(user, "SuperAdmin"))
    .slice(0, 4);

  return (
    <>
      <div className="px-5 sm:px-6 py-5 sm:py-6 border-b-2">
        <NavLink to="/" className="block focus-visible:outline-none focus-visible:underline">
          <div className="text-2xl font-bold tracking-tight">Jaza Venus</div>
          <div className="text-sm text-muted-foreground">Warehouse Management</div>
        </NavLink>
      </div>

      <nav className="flex flex-col gap-4 flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-4" aria-label="Main navigation">
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

        {/* Recent — only show if the user has been around at least once */}
        {recent.length > 0 && (
          <div>
            <div className="px-3 mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden />
              Recent
            </div>
            <ul className="flex flex-col gap-1">
              {recent.map((r) => (
                <li key={r.id}>
                  <NavLink
                    to={r.path}
                    className={({ isActive }) =>
                      cn(
                        "block rounded-[var(--radius)] px-3 py-2 text-base min-h-[2.5rem]",
                        "truncate transition-colors",
                        isActive ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-accent",
                      )
                    }
                  >
                    {r.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Main sections */}
        <ul className="flex flex-col gap-1">
          {sections
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
      </nav>
    </>
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
