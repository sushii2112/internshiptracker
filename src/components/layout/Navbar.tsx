import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaCog, FaSignOutAlt } from "react-icons/fa";
import { FiMenu } from "react-icons/fi";
import { useAuth } from "@/context/AuthContext";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

const links = [
  { name: "Applications", path: "/applications" },
  { name: "Diaries", path: "/diaries" },
  { name: "Reflections", path: "/reflections" },
  { name: "Calendar", path: "/calendar" },
  { name: "Analytics", path: "/analytics" },
];

function isActive(pathname: string, path: string) {
  return path === "/" ? pathname === "/" : pathname.startsWith(path);
}

export default function Navbar() {
  const location = useLocation();
  const { signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const settingsActive = location.pathname === "/settings";
  const dashboardActive = location.pathname === "/";

  return (
    <header className="border-b border-sidebar-border bg-sidebar">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5 md:px-12">
        <Link
          to="/"
          aria-label="Dashboard"
          aria-current={dashboardActive ? "page" : undefined}
          className="touch-manipulation"
        >
          <span
            className={`font-heading text-2xl leading-none tracking-tight transition-colors ${
              dashboardActive ? "text-primary" : "text-sidebar-foreground hover:text-primary"
            }`}
          >
            OfferFlow
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {links.map((link) => {
            const active = isActive(location.pathname, link.path);
            return (
              <Link
                key={link.path}
                to={link.path}
                aria-current={active ? "page" : undefined}
                className={`small-caps transition-colors touch-manipulation ${
                  active ? "text-primary" : "hover:text-sidebar-foreground"
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        {/* Right-side actions (desktop) */}
        <div className="hidden items-center gap-1 lg:flex">
          <Link
            to="/settings"
            aria-label="Settings"
            aria-current={settingsActive ? "page" : undefined}
            className={`flex h-9 w-9 items-center justify-center rounded-md transition-colors touch-manipulation ${
              settingsActive
                ? "bg-sidebar-accent text-primary"
                : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            }`}
          >
            <FaCog className="h-4 w-4" />
          </Link>
          <button
            onClick={signOut}
            aria-label="Sign out"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground touch-manipulation"
          >
            <FaSignOutAlt className="h-4 w-4" />
          </button>
        </div>

        {/* Mobile menu trigger */}
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            aria-label="Open menu"
            className="flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground touch-manipulation lg:hidden"
          >
            <FiMenu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="right" className="w-72 gap-0 p-0">
            <SheetTitle className="border-b border-border">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                aria-current={dashboardActive ? "page" : undefined}
                className={`block px-6 py-5 font-heading text-2xl tracking-tight transition-colors touch-manipulation ${
                  dashboardActive ? "text-primary" : "text-foreground"
                }`}
              >
                OfferFlow
              </Link>
            </SheetTitle>

            <nav className="flex flex-col px-3 py-4">
              {links.map((link) => {
                const active = isActive(location.pathname, link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    onClick={() => setOpen(false)}
                    aria-current={active ? "page" : undefined}
                    className={`rounded-md px-3 py-3 transition-colors touch-manipulation ${
                      active
                        ? "bg-sidebar-accent text-primary"
                        : "text-foreground hover:bg-sidebar-accent/60"
                    }`}
                  >
                    <span className="small-caps">{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto flex flex-col gap-1 border-t border-border px-3 py-4">
              <Link
                to="/settings"
                onClick={() => setOpen(false)}
                aria-current={settingsActive ? "page" : undefined}
                className={`flex items-center gap-3 rounded-md px-3 py-3 transition-colors touch-manipulation ${
                  settingsActive
                    ? "bg-sidebar-accent text-primary"
                    : "text-foreground hover:bg-sidebar-accent/60"
                }`}
              >
                <FaCog className="h-4 w-4" />
                <span className="small-caps">Settings</span>
              </Link>
              <button
                onClick={() => {
                  setOpen(false);
                  signOut();
                }}
                className="flex items-center gap-3 rounded-md px-3 py-3 text-foreground transition-colors hover:bg-sidebar-accent/60 touch-manipulation"
              >
                <FaSignOutAlt className="h-4 w-4" />
                <span className="small-caps">Sign out</span>
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
