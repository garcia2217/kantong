"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_ITEMS } from "./Sidebar";

export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      role="navigation"
      aria-label="Tab bar navigation"
      className="md:hidden"
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        height: 56,
        paddingBottom: "env(safe-area-inset-bottom)",
        background: "var(--color-bg-sidebar)",
        borderTop: "0.5px solid var(--color-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-around",
        zIndex: 100,
      }}
    >
      {NAV_ITEMS.map(({ href, label, Icon }) => {
        const isActive = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            style={{ flex: 1, textDecoration: "none" }}
          >
            <button
              className="tab-item"
              aria-label={label}
              aria-current={isActive ? "page" : undefined}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 3,
                width: "100%",
                minWidth: 44,
                minHeight: 44,
                padding: "var(--space-1)",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: isActive
                  ? "var(--color-text-primary)"
                  : "var(--color-text-tertiary)",
              }}
            >
              <Icon size={18} />
              <span
                style={{
                  fontSize: 10,
                  fontWeight: isActive
                    ? "var(--weight-medium)"
                    : "var(--weight-normal)",
                  lineHeight: 1,
                }}
              >
                {label}
              </span>
            </button>
          </Link>
        );
      })}
    </nav>
  );
}
