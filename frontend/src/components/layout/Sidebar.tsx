"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/auth";

// ─── Icon Components ──────────────────────────────────────────────────────────

interface IconProps {
  size?: number;
}

const IconOverview = ({ size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 7L8 2L14 7V14H10V10H6V14H2V7Z" />
  </svg>
);

const IconTransactions = ({ size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 2V13M2 10L5 13L8 10" />
    <path d="M11 14V3M8 6L11 3L14 6" />
  </svg>
);

const IconBudget = ({ size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M2 14H14" />
    <rect x="2.5" y="9" width="3" height="5" />
    <rect x="6.5" y="5" width="3" height="9" />
    <rect x="10.5" y="2" width="3" height="12" />
  </svg>
);

const IconDebts = ({ size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="5.5" cy="4.5" r="2" />
    <path d="M1 14C1 11.2 3 9 5.5 9" />
    <circle cx="11" cy="4.5" r="2" />
    <path d="M8.5 10C9 9.3 10 9 11 9C13.5 9 15 11.2 15 14" />
  </svg>
);

const IconSettings = ({ size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="2" />
    <path d="M8 1V3M8 13V15M1 8H3M13 8H15M3.2 3.2L4.6 4.6M11.4 11.4L12.8 12.8M12.8 3.2L11.4 4.6M4.6 11.4L3.2 12.8" />
  </svg>
);

const IconLogout = ({ size = 16 }: IconProps) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M6 2H3C2.4 2 2 2.4 2 3V13C2 13.6 2.4 14 3 14H6" />
    <path d="M11 11L14 8L11 5" />
    <path d="M14 8H6" />
  </svg>
);

// ─── Nav Items ────────────────────────────────────────────────────────────────

export interface NavItem {
  href: string;
  label: string;
  Icon: (props: IconProps) => React.ReactElement;
}

export const NAV_ITEMS: NavItem[] = [
  { href: "/overview", label: "Overview", Icon: IconOverview },
  { href: "/transactions", label: "Transactions", Icon: IconTransactions },
  { href: "/budget", label: "Budget", Icon: IconBudget },
  { href: "/debts", label: "Debts", Icon: IconDebts },
  { href: "/settings", label: "Settings", Icon: IconSettings },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuthStore((s) => s.logout);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  return (
    <aside
      className="hidden md:fixed md:inset-y-0 md:left-0 md:z-30 md:flex md:w-40 md:flex-col md:overflow-y-auto"
      style={{
        flexShrink: 0,
        background: "var(--color-bg-sidebar)",
        borderRight: "0.5px solid var(--color-border)",
        padding: "var(--space-4) var(--space-3)",
      }}
    >
      {/* App name */}
      <div
        style={{
          padding: "var(--space-1) var(--space-2)",
          marginBottom: "var(--space-6)",
        }}
      >
        <p
          style={{
            fontSize: "var(--text-sm)",
            fontWeight: "var(--weight-semibold)",
            color: "var(--color-text-primary)",
            letterSpacing: "-0.01em",
          }}
        >
          Finance Tracker
        </p>
      </div>

      {/* Nav items */}
      <nav
        role="navigation"
        aria-label="Main navigation"
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "var(--space-1)",
        }}
      >
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link key={href} href={href} style={{ textDecoration: "none" }}>
              <div
                className="nav-item"
                role="menuitem"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--space-2)",
                  padding: "var(--space-1) var(--space-2)",
                  borderRadius: "var(--radius-md)",
                  fontSize: "var(--text-sm)",
                  color: isActive
                    ? "var(--color-text-primary)"
                    : "var(--color-text-secondary)",
                  fontWeight: isActive
                    ? "var(--weight-medium)"
                    : "var(--weight-normal)",
                  background: isActive ? "var(--color-bg-active)" : "transparent",
                  cursor: "pointer",
                  minHeight: 32,
                  transition: "background 0.1s ease, color 0.1s ease",
                }}
              >
                <Icon size={16} />
                {label}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={handleLogout}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          padding: "var(--space-1) var(--space-2)",
          borderRadius: "var(--radius-md)",
          fontSize: "var(--text-sm)",
          color: "var(--color-text-tertiary)",
          background: "transparent",
          border: "none",
          cursor: "pointer",
          width: "100%",
          textAlign: "left",
          minHeight: 32,
        }}
      >
        <IconLogout size={16} />
        Log out
      </button>
    </aside>
  );
}
