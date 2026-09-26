"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/src/store/auth";
import { KantongMark } from "@/src/components/ui/KantongMark";

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
    router.push("/");
  };

  return (
    <aside className="app-sidebar hidden md:flex">
      <Link href="/overview" className="app-sidebar__brand">
        <KantongMark />
        Kantong
      </Link>

      <nav aria-label="Main navigation" className="app-sidebar__nav">
        {NAV_ITEMS.map(({ href, label, Icon }) => {
          const isActive = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              className="app-nav-link"
              aria-current={isActive ? "page" : undefined}
            >
              <Icon size={18} />
              {label}
            </Link>
          );
        })}
      </nav>

      <button type="button" onClick={handleLogout} className="app-nav-link app-sidebar__logout">
        <IconLogout size={18} />
        Log out
      </button>
    </aside>
  );
}
