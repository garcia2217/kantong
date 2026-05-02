"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/auth";
import { walletService } from "@/src/lib/api/services/wallets";
import { categoryService } from "@/src/lib/api/services/categories";
import { WALLET_KEYS, CATEGORY_KEYS } from "@/src/lib/api/keys";
import { formatIDR } from "@/src/lib/utils/format";
import { WalletSheet } from "@/src/components/features/WalletSheet";
import { CategorySheet } from "@/src/components/features/CategorySheet";
import { TelegramLinkSection } from "@/src/components/features/TelegramLinkSection";
import type { Wallet, Category, CategoryType } from "@/src/types";

// ─── Icon components ───────────────────────────────────────────────────────────

function EditIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M9.5 2.5L11.5 4.5L4.5 11.5H2.5V9.5L9.5 2.5Z" />
        </svg>
    );
}

function TrashIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
        >
            <path d="M2 3.5H12" />
            <path d="M5 3.5V2.5C5 2 5.5 1.5 6 1.5H8C8.5 1.5 9 2 9 2.5V3.5" />
            <path d="M5.5 6V11M8.5 6V11" />
            <path d="M2.5 3.5L3 12C3 12.5 3.5 13 4 13H10C10.5 13 11 12.5 11 12L11.5 3.5" />
        </svg>
    );
}

function PlusIcon() {
    return (
        <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            aria-hidden="true"
        >
            <path d="M7 2V12M2 7H12" />
        </svg>
    );
}

function LogoutIcon() {
    return (
        <svg
            width="18"
            height="18"
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
}

// ─── Row components ────────────────────────────────────────────────────────────

interface RowProps {
    primary: string;
    secondary?: string;
    badge?: { label: string; color: string; bg: string };
    onEdit: () => void;
    onDelete: () => void;
    isDeleting?: boolean;
}

function ItemRow({
    primary,
    secondary,
    badge,
    onEdit,
    onDelete,
    isDeleting,
}: RowProps) {
    const actionBtnStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 44,
        minHeight: 44,
        padding: "var(--space-2)",
        borderRadius: "var(--radius-sm)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
    };

    return (
        <div
            style={{
                display: "flex",
                alignItems: "center",
                gap: "var(--space-3)",
                padding: "var(--space-2) var(--space-3)",
                minHeight: 52,
            }}
        >
            <div style={{ flex: 1, minWidth: 0 }}>
                <div
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "var(--space-2)",
                        flexWrap: "wrap",
                    }}
                >
                    <p
                        style={{
                            fontSize: "var(--text-base)",
                            fontWeight: "var(--weight-medium)",
                            color: "var(--color-text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {primary}
                    </p>
                    {badge && (
                        <span
                            style={{
                                fontSize: "var(--text-xs)",
                                fontWeight: "var(--weight-medium)",
                                color: badge.color,
                                background: badge.bg,
                                padding: "1px 6px",
                                borderRadius: "var(--radius-full)",
                                textTransform: "capitalize",
                                flexShrink: 0,
                            }}
                        >
                            {badge.label}
                        </span>
                    )}
                </div>
                {secondary && (
                    <p
                        style={{
                            fontSize: "var(--text-sm)",
                            color: "var(--color-text-tertiary)",
                            marginTop: 1,
                        }}
                    >
                        {secondary}
                    </p>
                )}
            </div>

            <div
                style={{
                    display: "flex",
                    gap: "var(--space-1)",
                    flexShrink: 0,
                }}
            >
                <button
                    onClick={onEdit}
                    aria-label={`Edit ${primary}`}
                    style={{
                        ...actionBtnStyle,
                        color: "var(--color-text-secondary)",
                    }}
                >
                    <EditIcon />
                </button>
                <button
                    onClick={onDelete}
                    disabled={isDeleting}
                    aria-label={`Delete ${primary}`}
                    style={{
                        ...actionBtnStyle,
                        color: isDeleting
                            ? "var(--color-text-tertiary)"
                            : "var(--color-negative)",
                    }}
                >
                    <TrashIcon />
                </button>
            </div>
        </div>
    );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

interface WalletSheetState {
    open: boolean;
    wallet?: Wallet;
}

interface CategorySheetState {
    open: boolean;
    category?: Category;
    defaultType?: CategoryType;
}

export default function SettingsPage() {
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);
    const queryClient = useQueryClient();

    const [walletSheet, setWalletSheet] = useState<WalletSheetState>({
        open: false,
    });
    const [categorySheet, setCategorySheet] = useState<CategorySheetState>({
        open: false,
    });

    const { data: wallets = [], isLoading: walletsLoading } = useQuery({
        queryKey: WALLET_KEYS.all,
        queryFn: walletService.getAll,
    });

    const { data: categories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: CATEGORY_KEYS.all,
        queryFn: categoryService.getAll,
    });

    const deleteWallet = useMutation({
        mutationFn: walletService.delete,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: WALLET_KEYS.all }),
    });

    const deleteCategory = useMutation({
        mutationFn: categoryService.delete,
        onSuccess: () =>
            queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all }),
    });

    const handleDeleteWallet = (wallet: Wallet) => {
        if (window.confirm(`Delete "${wallet.name}"? This cannot be undone.`)) {
            deleteWallet.mutate(wallet.id);
        }
    };

    const handleDeleteCategory = (category: Category) => {
        if (
            window.confirm(`Delete "${category.name}"? This cannot be undone.`)
        ) {
            deleteCategory.mutate(category.id);
        }
    };

    const handleLogout = () => {
        logout();
        router.push("/login");
    };

    const incomeCategories = categories.filter((c) => c.type === "income");
    const expenseCategories = categories.filter((c) => c.type === "expense");

    const sectionCardStyle: React.CSSProperties = {
        background: "var(--color-bg-card)",
        border: "0.5px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        overflow: "hidden",
    };

    const sectionHeaderStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "var(--space-3) var(--space-4)",
        borderBottom: "0.5px solid var(--color-border)",
    };

    const subHeaderStyle: React.CSSProperties = {
        padding: "var(--space-2) var(--space-4)",
        background: "var(--color-bg-subtle)",
        borderTop: "0.5px solid var(--color-border)",
        fontSize: "var(--text-xs)",
        fontWeight: "var(--weight-medium)",
        color: "var(--color-text-tertiary)",
        textTransform: "uppercase",
        letterSpacing: "0.06em",
    };

    const addRowStyle: React.CSSProperties = {
        display: "flex",
        alignItems: "center",
        gap: "var(--space-2)",
        width: "100%",
        minHeight: 44,
        padding: "var(--space-2) var(--space-4)",
        background: "transparent",
        border: "none",
        borderTop: "0.5px solid var(--color-border)",
        cursor: "pointer",
        color: "var(--color-accent)",
        fontSize: "var(--text-sm)",
        fontWeight: "var(--weight-medium)",
        textAlign: "left" as const,
    };

    const dividerStyle: React.CSSProperties = {
        margin: "0 var(--space-4)",
        height: "0.5px",
        background: "var(--color-border)",
    };

    const skeletonRow = (
        <div
            style={{
                height: 52,
                display: "flex",
                alignItems: "center",
                padding: "var(--space-2) var(--space-4)",
                gap: "var(--space-3)",
            }}
        >
            <div
                style={{
                    flex: 1,
                    height: 16,
                    background: "var(--color-bg-subtle)",
                    borderRadius: "var(--radius-sm)",
                }}
            />
        </div>
    );

    return (
        <>
            {/* Mobile top bar */}
            <header
                className="md:hidden"
                style={{
                    position: "sticky",
                    top: 0,
                    zIndex: 40,
                    display: "flex",
                    alignItems: "center",
                    height: 56,
                    padding: "0 var(--space-4)",
                    background: "var(--color-bg-base)",
                    borderBottom: "0.5px solid var(--color-border)",
                }}
            >
                <h1
                    style={{
                        fontSize: "var(--text-lg)",
                        fontWeight: "var(--weight-semibold)",
                        color: "var(--color-text-primary)",
                    }}
                >
                    Settings
                </h1>
            </header>

            {/* Page content */}
            <main
                style={{
                    maxWidth: 640,
                    margin: "0 auto",
                    padding: "var(--space-6) var(--space-4)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "var(--space-6)",
                }}
            >
                {/* Desktop title */}
                <h1
                    className="hidden md:block"
                    style={{
                        fontSize: "var(--text-2xl)",
                        fontWeight: "var(--weight-semibold)",
                        color: "var(--color-text-primary)",
                    }}
                >
                    Settings
                </h1>

                {/* ── Wallets section ─────────────────────────────────────────── */}
                <section>
                    <div style={sectionCardStyle}>
                        <div style={sectionHeaderStyle}>
                            <h2
                                style={{
                                    fontSize: "var(--text-base)",
                                    fontWeight: "var(--weight-semibold)",
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                Wallets
                            </h2>
                            <span
                                style={{
                                    fontSize: "var(--text-sm)",
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                {wallets.length}{" "}
                                {wallets.length === 1 ? "wallet" : "wallets"}
                            </span>
                        </div>

                        {walletsLoading ? (
                            <>
                                {skeletonRow}
                                <div style={dividerStyle} />
                                {skeletonRow}
                            </>
                        ) : wallets.length === 0 ? (
                            <p
                                style={{
                                    padding: "var(--space-6) var(--space-4)",
                                    textAlign: "center",
                                    fontSize: "var(--text-sm)",
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                No wallets yet.
                            </p>
                        ) : (
                            wallets.map((wallet, idx) => (
                                <div key={wallet.id}>
                                    {idx > 0 && <div style={dividerStyle} />}
                                    <ItemRow
                                        primary={wallet.name}
                                        secondary={formatIDR(wallet.balance)}
                                        onEdit={() =>
                                            setWalletSheet({
                                                open: true,
                                                wallet,
                                            })
                                        }
                                        onDelete={() =>
                                            handleDeleteWallet(wallet)
                                        }
                                        isDeleting={
                                            deleteWallet.isPending &&
                                            deleteWallet.variables === wallet.id
                                        }
                                    />
                                </div>
                            ))
                        )}

                        <button
                            onClick={() => setWalletSheet({ open: true })}
                            style={addRowStyle}
                        >
                            <PlusIcon />
                            Add wallet
                        </button>
                    </div>
                </section>

                {/* ── Categories section ───────────────────────────────────────── */}
                <section>
                    <div style={sectionCardStyle}>
                        <div style={sectionHeaderStyle}>
                            <h2
                                style={{
                                    fontSize: "var(--text-base)",
                                    fontWeight: "var(--weight-semibold)",
                                    color: "var(--color-text-primary)",
                                }}
                            >
                                Categories
                            </h2>
                            <span
                                style={{
                                    fontSize: "var(--text-sm)",
                                    color: "var(--color-text-tertiary)",
                                }}
                            >
                                {categories.length} total
                            </span>
                        </div>

                        {categoriesLoading ? (
                            <>
                                {skeletonRow}
                                <div style={dividerStyle} />
                                {skeletonRow}
                            </>
                        ) : (
                            <>
                                {/* Income sub-section */}
                                <div style={subHeaderStyle}>Income</div>
                                {incomeCategories.length === 0 ? (
                                    <p
                                        style={{
                                            padding:
                                                "var(--space-3) var(--space-4)",
                                            fontSize: "var(--text-sm)",
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        No income categories yet.
                                    </p>
                                ) : (
                                    incomeCategories.map((cat, idx) => (
                                        <div key={cat.id}>
                                            {idx > 0 && (
                                                <div style={dividerStyle} />
                                            )}
                                            <ItemRow
                                                primary={cat.name}
                                                badge={{
                                                    label: "income",
                                                    color: "var(--color-positive)",
                                                    bg: "var(--color-positive-bg)",
                                                }}
                                                onEdit={() =>
                                                    setCategorySheet({
                                                        open: true,
                                                        category: cat,
                                                    })
                                                }
                                                onDelete={() =>
                                                    handleDeleteCategory(cat)
                                                }
                                                isDeleting={
                                                    deleteCategory.isPending &&
                                                    deleteCategory.variables ===
                                                        cat.id
                                                }
                                            />
                                        </div>
                                    ))
                                )}
                                <button
                                    onClick={() =>
                                        setCategorySheet({
                                            open: true,
                                            defaultType: "income",
                                        })
                                    }
                                    style={addRowStyle}
                                >
                                    <PlusIcon />
                                    Add income category
                                </button>

                                {/* Expense sub-section */}
                                <div
                                    style={{
                                        ...subHeaderStyle,
                                        borderTop:
                                            "0.5px solid var(--color-border)",
                                    }}
                                >
                                    Expense
                                </div>
                                {expenseCategories.length === 0 ? (
                                    <p
                                        style={{
                                            padding:
                                                "var(--space-3) var(--space-4)",
                                            fontSize: "var(--text-sm)",
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        No expense categories yet.
                                    </p>
                                ) : (
                                    expenseCategories.map((cat, idx) => (
                                        <div key={cat.id}>
                                            {idx > 0 && (
                                                <div style={dividerStyle} />
                                            )}
                                            <ItemRow
                                                primary={cat.name}
                                                badge={{
                                                    label: "expense",
                                                    color: "var(--color-text-secondary)",
                                                    bg: "var(--color-tag-bg)",
                                                }}
                                                onEdit={() =>
                                                    setCategorySheet({
                                                        open: true,
                                                        category: cat,
                                                    })
                                                }
                                                onDelete={() =>
                                                    handleDeleteCategory(cat)
                                                }
                                                isDeleting={
                                                    deleteCategory.isPending &&
                                                    deleteCategory.variables ===
                                                        cat.id
                                                }
                                            />
                                        </div>
                                    ))
                                )}
                                <button
                                    onClick={() =>
                                        setCategorySheet({
                                            open: true,
                                            defaultType: "expense",
                                        })
                                    }
                                    style={addRowStyle}
                                >
                                    <PlusIcon />
                                    Add expense category
                                </button>
                            </>
                        )}
                    </div>
                </section>

                {/* ── Telegram section ────────────────────────────────────────── */}
                <TelegramLinkSection />

                {/* Mobile-only: log out (sidebar is hidden below md) */}
                <section className="md:hidden" aria-label="Account">
                    <div style={sectionCardStyle}>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-[var(--radius-lg)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                gap: "var(--space-2)",
                                width: "100%",
                                minHeight: 48,
                                padding: "var(--space-3) var(--space-4)",
                                background: "transparent",
                                border: "none",
                                cursor: "pointer",
                                fontSize: "var(--text-base)",
                                fontWeight: "var(--weight-medium)",
                                color: "var(--color-text-secondary)",
                            }}
                        >
                            <LogoutIcon />
                            Log out
                        </button>
                    </div>
                </section>
            </main>

            {/* ── Sheets ──────────────────────────────────────────────────────── */}
            <WalletSheet
                isOpen={walletSheet.open}
                onClose={() => setWalletSheet({ open: false })}
                wallet={walletSheet.wallet}
            />
            <CategorySheet
                isOpen={categorySheet.open}
                onClose={() => setCategorySheet({ open: false })}
                category={categorySheet.category}
                defaultType={categorySheet.defaultType}
            />
        </>
    );
}
