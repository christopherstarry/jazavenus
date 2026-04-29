import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router";
import { useAuth, hasRole, type CurrentUser } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Boxes, FileText, Home, LogOut, PackageSearch, Truck, Users, Settings, ClipboardList,
  ArrowLeftRight, BarChart3, Menu,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  description: string;
  superAdminOnly?: boolean;
}

const NAV_GROUPS: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { to: "/", label: "Dashboard", icon: Home, description: "Daily summary at a glance" },
    ],
  },
  {
    title: "Master data",
    items: [
      { to: "/items",     label: "Items",     icon: Boxes,         description: "Products you sell or store" },
      { to: "/suppliers", label: "Suppliers", icon: PackageSearch, description: "Companies you buy from" },
      { to: "/customers", label: "Customers", icon: Users,         description: "Companies you sell to" },
    ],
  },
  {
    title: "Daily work",
    items: [
      { to: "/inbound",  label: "Goods coming in", icon: Truck,         description: "Receive stock (GRN)" },
      { to: "/outbound", label: "Goods going out", icon: ArrowLeftRight,description: "Send stock to customers (DO)" },
      { to: "/invoices", label: "Invoices",        icon: FileText,      description: "Bills and payments" },
      { to: "/stock",    label: "Stock on hand",   icon: ClipboardList, description: "What you have right now" },
    ],
  },
  {
    title: "Reports",
    items: [
      { to: "/reports", label: "Reports", icon: BarChart3, description: "Numbers and trends" },
    ],
  },
];

function findCurrent(pathname: string): NavItem | undefined {
  const all = NAV_GROUPS.flatMap((g) => g.items);
  return all
    .filter((i) => pathname === i.to || (i.to !== "/" && pathname.startsWith(i.to)))
    .sort((a, b) => b.to.length - a.to.length)[0];
}

/** "Maria Da Silva" → "MD". Falls back to email's first 2 letters. */
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
  const current = findCurrent(location.pathname);

  /* Auto-close the mobile drawer when the user picks an item. */
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  /* Global '/' jumps to search if there is one on the current page. */
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

  const sidebar = <SidebarBody user={user} />;

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

/** Compact icon-only avatar in the header that opens a popover with profile details + actions. */
function UserMenu({
  user, onSettings, onLogout,
}: { user: CurrentUser; onSettings: () => void; onLogout: () => void }) {
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
          <UserMenuItem icon={Settings}        label="Settings"  onClick={() => { setOpen(false); onSettings(); }} />
          <UserMenuItem icon={LogOut}          label="Sign out"  onClick={() => { setOpen(false); onLogout(); }} tone="destructive" />
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

/** The sidebar contents — used both inside the desktop <aside> and the mobile drawer.
 *  Nav-only now: profile and Settings/Sign out moved to the header user menu, which keeps
 *  the sidebar compact at any text size. */
function SidebarBody({ user }: { user: CurrentUser | null }) {
  return (
    <>
      <div className="px-5 sm:px-6 py-5 sm:py-6 border-b-2">
        <div className="text-2xl font-bold tracking-tight">Jaza Venus</div>
        <div className="text-sm text-muted-foreground">Warehouse Management</div>
      </div>

      <nav className="flex flex-col gap-5 flex-1 overflow-y-auto p-3 sm:p-4" aria-label="Main navigation">
        {NAV_GROUPS.map((group) => (
          <div key={group.title}>
            <div className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {group.title}
            </div>
            <ul className="flex flex-col gap-1">
              {group.items
                .filter((i) => !i.superAdminOnly || hasRole(user, "SuperAdmin"))
                .map(({ to, label, icon: Icon, description }) => (
                  <li key={to}>
                    <NavLink
                      to={to}
                      end={to === "/"}
                      className={({ isActive }) =>
                        cn(
                          "flex items-start gap-3 rounded-[var(--radius)] px-3 py-3 transition-colors min-h-[3.25rem]",
                          isActive
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-foreground hover:bg-accent"
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <Icon className="h-6 w-6 mt-0.5 shrink-0" aria-hidden />
                          <div className="min-w-0">
                            <div className="font-semibold text-base leading-tight">{label}</div>
                            <div className={cn("text-sm leading-tight mt-0.5", isActive ? "text-primary-foreground/85" : "text-muted-foreground")}>
                              {description}
                            </div>
                          </div>
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
            </ul>
          </div>
        ))}
      </nav>
    </>
  );
}
