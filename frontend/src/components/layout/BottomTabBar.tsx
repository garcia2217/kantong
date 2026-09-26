"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./Sidebar";

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav aria-label="Main navigation" className="app-tabbar">
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className="app-tab"
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={20} />
            <span className="app-tab__label">{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
