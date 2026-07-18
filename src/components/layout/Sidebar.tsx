import { Link, useLocation } from "react-router-dom";
import type { IconType } from "react-icons";
import {
  FaHome,
  FaBriefcase,
  FaCalendarAlt,
  FaChartBar,
  FaCog,
  FaBook,
} from "react-icons/fa";

const links: { name: string; path: string; icon: IconType }[] = [
  { name: "Dashboard", path: "/", icon: FaHome },
  { name: "Applications", path: "/applications", icon: FaBriefcase },
  { name: "Diaries", path: "/diaries", icon: FaBook },
  { name: "Calendar", path: "/calendar", icon: FaCalendarAlt },
  { name: "Analytics", path: "/analytics", icon: FaChartBar },
  { name: "Settings", path: "/settings", icon: FaCog },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar">
      <div className="px-7 py-8">
        <Link to="/" className="touch-manipulation">
          <span className="font-heading text-2xl leading-none tracking-tight text-sidebar-foreground">
            OfferFlow
          </span>
        </Link>
      </div>

      <div className="mx-7 h-px bg-sidebar-border" />

      <nav className="flex flex-1 flex-col gap-1 px-4 py-6">
        {links.map(({ name, path, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              aria-current={active ? "page" : undefined}
              className={`group relative flex items-center gap-3 rounded-md px-3.5 py-2.5 text-sm font-medium tracking-[0.02em] transition-colors touch-manipulation ${
                active
                  ? "bg-sidebar-accent text-sidebar-foreground font-semibold"
                  : "text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-primary transition-opacity duration-200 ${
                  active ? "opacity-100" : "opacity-0"
                }`}
              />
              <Icon
                className={`h-4 w-4 shrink-0 ${
                  active
                    ? "text-primary"
                    : "text-muted-foreground/70 group-hover:text-sidebar-foreground"
                }`}
              />
              {name}
            </Link>
          );
        })}
      </nav>

      <div className="px-7 py-6">
        <div className="mb-4 h-px bg-sidebar-border" />
        <p className="small-caps">Internship Tracker</p>
      </div>
    </aside>
  );
}
