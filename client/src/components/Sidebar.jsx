import { NavLink } from "react-router-dom";
import Logo from "./Logo";
import { cn } from "@/lib/utils";

export default function Sidebar({ links, footer = "CuccuPos v1.0" }) {
  return (
    <aside className="relative flex flex-col overflow-hidden px-4 py-4 text-sidebar-foreground print:hidden lg:py-6 lg:pl-5 lg:pr-0">
      <Logo size={52} text className="mb-4 lg:mb-10 lg:px-2" />
      <nav className="flex flex-row flex-wrap gap-2 lg:flex-col lg:gap-2.5">
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-2xl px-4 py-2.5 text-base font-medium transition-colors hover:bg-black/15 lg:py-3 lg:text-lg",
                isActive && "bg-sidebar-active shadow-md hover:bg-sidebar-active"
              )
            }
          >
            <l.icon className="h-5 w-5" />
            {l.label}
            {l.badge > 0 && (
              <span className="ml-auto rounded-full bg-red-500 px-2 py-0.5 text-xs font-bold text-white">{l.badge}</span>
            )}
          </NavLink>
        ))}
      </nav>
      <div className="mt-auto hidden items-center gap-1.5 pt-8 text-sm lg:flex">
        <span className="h-2 w-2 rounded-full bg-green-400" /> {footer}
      </div>
    </aside>
  );
}
