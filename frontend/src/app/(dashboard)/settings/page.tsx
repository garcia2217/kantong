"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/src/store/auth";
import { walletService } from "@/src/lib/api/services/wallets";
import { categoryService } from "@/src/lib/api/services/categories";
import { WALLET_KEYS, CATEGORY_KEYS, TRANSACTION_KEYS, BUDGET_KEYS } from "@/src/lib/api/keys";
import { WalletSheet } from "@/src/components/features/WalletSheet";
import { WalletSettingsRow } from "@/src/components/features/WalletSettingsRow";
import { CategorySheet } from "@/src/components/features/CategorySheet";
import { CategorySettingsGroup } from "@/src/components/features/CategorySettingsGroup";
import { TelegramLinkSection } from "@/src/components/features/TelegramLinkSection";
import type { Wallet, Category, CategoryType } from "@/src/types";

// ─── Icon components ───────────────────────────────────────────────────────────

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

function ChevronDown() {
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
            <path d="M3 5l4 4 4-4" />
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
    const [walletsOpen, setWalletsOpen] = useState(true);
    const [categoriesOpen, setCategoriesOpen] = useState(true);

    const { data: wallets = [], isLoading: walletsLoading, isError: walletsError, refetch: refetchWallets } = useQuery({
        queryKey: WALLET_KEYS.all,
        queryFn: walletService.getAll,
    });

    const setDefaultWallet = useMutation({
        mutationFn: walletService.setDefault,
        onSuccess: (updated) => {
            queryClient.setQueryData<Wallet[]>(WALLET_KEYS.all, (current) =>
                current?.map((wallet) => ({ ...wallet, is_default: wallet.id === updated.id })),
            );
            void queryClient.invalidateQueries({ queryKey: WALLET_KEYS.all });
        },
    });

    const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError, refetch: refetchCategories } = useQuery({
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
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
            void queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all });
            void queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all });
        },
    });

    const handleDeleteWallet = (wallet: Wallet) => {
        if (window.confirm(`Delete "${wallet.name}"? This cannot be undone.`)) {
            deleteWallet.mutate(wallet.id);
        }
    };

    const handleDeleteCategory = (category: Category) => {
        if (
            window.confirm(
                `Delete "${category.name}"? Its budgets will be deleted, and past transactions will become uncategorized. This cannot be undone.`,
            )
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
    const orderedWallets = [...wallets].sort((a, b) => Number(b.is_default) - Number(a.is_default));

    const sectionCardStyle: React.CSSProperties = {
        background: "var(--color-bg-elevated)",
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
            <div className="settings-page">
                <header className="settings-header">
                    <h1>Settings</h1>
                    <p>Manage your wallets, categories, and connected services.</p>
                </header>

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
                            <button
                                onClick={() => setWalletsOpen((o) => !o)}
                                aria-expanded={walletsOpen}
                                aria-label={walletsOpen ? "Collapse wallets" : "Expand wallets"}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "var(--space-1)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "var(--color-text-tertiary)",
                                    fontSize: "var(--text-sm)",
                                    minHeight: 44,
                                    padding: "0 var(--space-1)",
                                }}
                            >
                                {wallets.length}{" "}
                                {wallets.length === 1 ? "wallet" : "wallets"}
                                <span
                                    style={{
                                        display: "inline-flex",
                                        transition: "transform 0.2s ease",
                                        transform: walletsOpen ? "rotate(0deg)" : "rotate(-90deg)",
                                    }}
                                >
                                    <ChevronDown />
                                </span>
                            </button>
                        </div>

                        {walletsOpen && (
                            <>
                                <p style={{ padding: "var(--space-3) var(--space-4)", color: "var(--color-text-secondary)", fontSize: "var(--text-sm)" }}>
                                    Used when a Telegram transaction does not name a wallet.
                                </p>
                                {setDefaultWallet.isError && (
                                    <p role="alert" style={{ padding: "0 var(--space-4) var(--space-3)", color: "var(--color-negative)", fontSize: "var(--text-sm)" }}>
                                        Could not change the default wallet. Try again.
                                    </p>
                                )}
                                {deleteWallet.isError && (
                                    <p role="alert" style={{ padding: "0 var(--space-4) var(--space-3)", color: "var(--color-negative)", fontSize: "var(--text-sm)" }}>
                                        Could not delete the wallet. Try again.
                                    </p>
                                )}
                                {walletsError && wallets.length > 0 && (
                                    <p role="alert" style={{ padding: "0 var(--space-4) var(--space-3)", color: "var(--color-negative)", fontSize: "var(--text-sm)" }}>
                                        Wallets could not be refreshed. <button type="button" onClick={() => void refetchWallets()} style={{ minHeight: 44, color: "var(--color-accent)", textDecoration: "underline" }}>Try again</button>
                                    </p>
                                )}
                                {walletsLoading ? (
                                    <>
                                        {skeletonRow}
                                        <div style={dividerStyle} />
                                        {skeletonRow}
                                    </>
                                ) : walletsError && wallets.length === 0 ? (
                                    <div role="alert" style={{ padding: "var(--space-4)", color: "var(--color-negative)", fontSize: "var(--text-sm)" }}>
                                        <p>Could not load wallets.</p>
                                        <button type="button" onClick={() => void refetchWallets()} style={{ minHeight: 44, color: "var(--color-accent)", textDecoration: "underline" }}>
                                            Try again
                                        </button>
                                    </div>
                                ) : wallets.length === 0 ? (
                                    <p
                                        style={{
                                            padding: "var(--space-6) var(--space-4)",
                                            textAlign: "center",
                                            fontSize: "var(--text-sm)",
                                            color: "var(--color-text-tertiary)",
                                        }}
                                    >
                                        No wallets yet. Add one to track where your money is held.
                                    </p>
                                ) : (
                                    orderedWallets.map((wallet, idx) => (
                                        <div key={wallet.id}>
                                            {idx > 0 && <div style={dividerStyle} />}
                                            <WalletSettingsRow
                                                wallet={wallet}
                                                onEdit={() =>
                                                    setWalletSheet({
                                                        open: true,
                                                        wallet,
                                                    })
                                                }
                                                onDelete={() => handleDeleteWallet(wallet)}
                                                onSetDefault={() => setDefaultWallet.mutate(wallet.id)}
                                                isDeleting={
                                                    deleteWallet.isPending &&
                                                    deleteWallet.variables === wallet.id
                                                }
                                                isSettingDefault={
                                                    setDefaultWallet.isPending &&
                                                    setDefaultWallet.variables === wallet.id
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
                            </>
                        )}
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
                            <button
                                onClick={() => setCategoriesOpen((o) => !o)}
                                aria-expanded={categoriesOpen}
                                aria-label={categoriesOpen ? "Collapse categories" : "Expand categories"}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "var(--space-1)",
                                    background: "none",
                                    border: "none",
                                    cursor: "pointer",
                                    color: "var(--color-text-tertiary)",
                                    fontSize: "var(--text-sm)",
                                    minHeight: 44,
                                    padding: "0 var(--space-1)",
                                }}
                            >
                                {categories.length} total
                                <span
                                    style={{
                                        display: "inline-flex",
                                        transition: "transform 0.2s ease",
                                        transform: categoriesOpen ? "rotate(0deg)" : "rotate(-90deg)",
                                    }}
                                >
                                    <ChevronDown />
                                </span>
                            </button>
                        </div>

                        {categoriesOpen && (
                            categoriesLoading ? (
                                <>
                                    {skeletonRow}
                                    <div style={dividerStyle} />
                                    {skeletonRow}
                                </>
                            ) : categoriesError && categories.length === 0 ? (
                                <div role="alert" style={{ padding: "var(--space-4)", color: "var(--color-negative)", fontSize: "var(--text-sm)" }}>
                                    <p>Could not load categories.</p>
                                    <button type="button" onClick={() => void refetchCategories()} style={{ minHeight: 44, color: "var(--color-accent)", textDecoration: "underline" }}>
                                        Try again
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {categoriesError && (
                                        <p role="alert" style={{ padding: "var(--space-3) var(--space-4)", color: "var(--color-negative)", fontSize: "var(--text-sm)" }}>
                                            Categories could not be refreshed. <button type="button" onClick={() => void refetchCategories()} style={{ minHeight: 44, color: "var(--color-accent)", textDecoration: "underline" }}>Try again</button>
                                        </p>
                                    )}
                                    {deleteCategory.isError && (
                                        <p role="alert" style={{ padding: "var(--space-3) var(--space-4)", color: "var(--color-negative)", fontSize: "var(--text-sm)" }}>
                                            Could not delete the category. Try again.
                                        </p>
                                    )}
                                    <CategorySettingsGroup
                                        type="income"
                                        categories={incomeCategories}
                                        onAdd={() => setCategorySheet({ open: true, defaultType: "income" })}
                                        onEdit={(category) => setCategorySheet({ open: true, category })}
                                        onDelete={handleDeleteCategory}
                                        deletingId={deleteCategory.isPending ? deleteCategory.variables : undefined}
                                    />
                                    <CategorySettingsGroup
                                        type="expense"
                                        categories={expenseCategories}
                                        onAdd={() => setCategorySheet({ open: true, defaultType: "expense" })}
                                        onEdit={(category) => setCategorySheet({ open: true, category })}
                                        onDelete={handleDeleteCategory}
                                        deletingId={deleteCategory.isPending ? deleteCategory.variables : undefined}
                                    />
                                </>
                            )
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
            </div>

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
