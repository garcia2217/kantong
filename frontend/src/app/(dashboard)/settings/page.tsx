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
import { BottomSheet } from "@/src/components/ui/BottomSheet";
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

type DeleteTarget =
    | { kind: "wallet"; wallet: Wallet }
    | { kind: "category"; category: Category };

export default function SettingsPage() {
    const router = useRouter();
    const logout = useAuthStore((s) => s.logout);
    const username = useAuthStore((s) => s.user?.username);
    const queryClient = useQueryClient();

    const [walletSheet, setWalletSheet] = useState<WalletSheetState>({
        open: false,
    });
    const [categorySheet, setCategorySheet] = useState<CategorySheetState>({
        open: false,
    });
    const [walletsOpen, setWalletsOpen] = useState(true);
    const [categoriesOpen, setCategoriesOpen] = useState(true);
    const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
    const [notice, setNotice] = useState<string | null>(null);

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
            setNotice(`"${updated.name}" is now your default wallet.`);
        },
    });

    const { data: categories = [], isLoading: categoriesLoading, isError: categoriesError, refetch: refetchCategories } = useQuery({
        queryKey: CATEGORY_KEYS.all,
        queryFn: categoryService.getAll,
    });

    const deleteWallet = useMutation({
        mutationFn: walletService.delete,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: WALLET_KEYS.all });
            setDeleteTarget(null);
            setNotice("Wallet deleted.");
        },
    });

    const deleteCategory = useMutation({
        mutationFn: categoryService.delete,
        onSuccess: () => {
            void queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
            void queryClient.invalidateQueries({ queryKey: TRANSACTION_KEYS.all });
            void queryClient.invalidateQueries({ queryKey: BUDGET_KEYS.all });
            setDeleteTarget(null);
            setNotice("Category deleted.");
        },
    });

    const openWalletDelete = (wallet: Wallet) => {
        deleteWallet.reset();
        setDeleteTarget({ kind: "wallet", wallet });
    };

    const openCategoryDelete = (category: Category) => {
        deleteCategory.reset();
        setDeleteTarget({ kind: "category", category });
    };

    const handleLogout = () => {
        logout();
        router.push("/");
    };

    const incomeCategories = categories.filter((c) => c.type === "income");
    const expenseCategories = categories.filter((c) => c.type === "expense");
    const orderedWallets = [...wallets].sort((a, b) => Number(b.is_default) - Number(a.is_default));
    const isDeleting = deleteWallet.isPending || deleteCategory.isPending;
    const walletDeleteBlocked = deleteWallet.error instanceof Error
        && "code" in deleteWallet.error
        && deleteWallet.error.code === "BUSINESS_RULE_VIOLATION"
        && deleteWallet.error.message.includes("associated transactions");
    const walletDeleteError = walletDeleteBlocked
        ? "This wallet has transactions. Move them to another wallet before deleting it."
        : "Could not confirm wallet deletion. Refresh the list before retrying.";

    const skeletonRows = (
        <div aria-hidden="true">
            <div className="settings-skeleton-row"><span className="settings-skeleton" /></div>
            <div className="settings-skeleton-row"><span className="settings-skeleton" /></div>
        </div>
    );

    return (
        <>
            <div className="settings-page">
                <header className="settings-header">
                    <h1>Settings</h1>
                    <p>Manage your wallets, categories, and connected services.</p>
                </header>
                <section aria-label="Account" className="settings-account">
                    <span className="settings-account__avatar" aria-hidden="true">
                        {(username ?? "K").charAt(0).toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                        <p className="settings-account__label">Signed in as</p>
                        <p className="settings-account__name">{username ? `@${username}` : "Your Kantong account"}</p>
                    </div>
                    <button type="button" onClick={handleLogout} className="settings-account__logout">
                        <LogoutIcon />
                        Log out
                    </button>
                </section>

                {notice && (
                    <div role="status" className="settings-notice">
                        <span>✓ {notice}</span>
                        <button type="button" onClick={() => setNotice(null)} aria-label="Dismiss notification">
                            Dismiss
                        </button>
                    </div>
                )}

                {/* ── Wallets section ─────────────────────────────────────────── */}
                <section aria-labelledby="settings-wallets-title" className="settings-card">
                    <div className="settings-card__head">
                        <div className="min-w-0">
                            <h2 id="settings-wallets-title" className="settings-card__title">Wallets</h2>
                            <p className="settings-card__subtitle">The default wallet is used when a Telegram message doesn&apos;t name one.</p>
                        </div>
                        <button
                            type="button"
                            className="settings-toggle"
                            onClick={() => setWalletsOpen((o) => !o)}
                            aria-expanded={walletsOpen}
                            aria-label={walletsOpen ? "Collapse wallets" : "Expand wallets"}
                        >
                            {wallets.length} {wallets.length === 1 ? "wallet" : "wallets"}
                            <ChevronDown />
                        </button>
                    </div>

                    {walletsOpen && (
                        <>
                            {setDefaultWallet.isError && (
                                <p role="alert" className="settings-inline-error">
                                    Could not change the default wallet. Try again.
                                </p>
                            )}
                            {walletsError && wallets.length > 0 && (
                                <p role="alert" className="settings-inline-error">
                                    Wallets could not be refreshed.{" "}
                                    <button type="button" className="settings-text-button" onClick={() => void refetchWallets()}>Try again</button>
                                </p>
                            )}
                            {walletsLoading ? (
                                skeletonRows
                            ) : walletsError && wallets.length === 0 ? (
                                <div role="alert" className="settings-state">
                                    <p>Could not load wallets.</p>
                                    <button type="button" className="settings-pill" onClick={() => void refetchWallets()}>
                                        Try again
                                    </button>
                                </div>
                            ) : wallets.length === 0 ? (
                                <p className="settings-empty">No wallets yet. Add one to track where your money is held.</p>
                            ) : (
                                <div className="settings-list">
                                    {orderedWallets.map((wallet) => (
                                        <WalletSettingsRow
                                            key={wallet.id}
                                            wallet={wallet}
                                            onEdit={() => setWalletSheet({ open: true, wallet })}
                                            onDelete={() => openWalletDelete(wallet)}
                                            onSetDefault={() => setDefaultWallet.mutate(wallet.id)}
                                            isDeleting={deleteWallet.isPending && deleteWallet.variables === wallet.id}
                                            isSettingDefault={setDefaultWallet.isPending && setDefaultWallet.variables === wallet.id}
                                        />
                                    ))}
                                </div>
                            )}

                            <button type="button" className="settings-add-row" onClick={() => setWalletSheet({ open: true })}>
                                <PlusIcon />
                                Add wallet
                            </button>
                        </>
                    )}
                </section>

                {/* ── Categories section ───────────────────────────────────────── */}
                <section aria-labelledby="settings-categories-title" className="settings-card">
                    <div className="settings-card__head">
                        <div className="min-w-0">
                            <h2 id="settings-categories-title" className="settings-card__title">Categories</h2>
                            <p className="settings-card__subtitle">Built-in categories can&apos;t be edited; your own can.</p>
                        </div>
                        <button
                            type="button"
                            className="settings-toggle"
                            onClick={() => setCategoriesOpen((o) => !o)}
                            aria-expanded={categoriesOpen}
                            aria-label={categoriesOpen ? "Collapse categories" : "Expand categories"}
                        >
                            {categories.length} total
                            <ChevronDown />
                        </button>
                    </div>

                    {categoriesOpen && (
                        categoriesLoading ? (
                            skeletonRows
                        ) : categoriesError && categories.length === 0 ? (
                            <div role="alert" className="settings-state">
                                <p>Could not load categories.</p>
                                <button type="button" className="settings-pill" onClick={() => void refetchCategories()}>
                                    Try again
                                </button>
                            </div>
                        ) : (
                            <>
                                {categoriesError && (
                                    <p role="alert" className="settings-inline-error">
                                        Categories could not be refreshed.{" "}
                                        <button type="button" className="settings-text-button" onClick={() => void refetchCategories()}>Try again</button>
                                    </p>
                                )}
                                <CategorySettingsGroup
                                    type="income"
                                    categories={incomeCategories}
                                    onAdd={() => setCategorySheet({ open: true, defaultType: "income" })}
                                    onEdit={(category) => setCategorySheet({ open: true, category })}
                                    onDelete={openCategoryDelete}
                                    deletingId={deleteCategory.isPending ? deleteCategory.variables : undefined}
                                />
                                <CategorySettingsGroup
                                    type="expense"
                                    categories={expenseCategories}
                                    onAdd={() => setCategorySheet({ open: true, defaultType: "expense" })}
                                    onEdit={(category) => setCategorySheet({ open: true, category })}
                                    onDelete={openCategoryDelete}
                                    deletingId={deleteCategory.isPending ? deleteCategory.variables : undefined}
                                />
                            </>
                        )
                    )}
                </section>

                {/* ── Telegram section ────────────────────────────────────────── */}
                <TelegramLinkSection />

            </div>

            {/* ── Sheets ──────────────────────────────────────────────────────── */}
            <WalletSheet
                isOpen={walletSheet.open}
                onClose={() => setWalletSheet({ open: false })}
                onSaved={setNotice}
                wallet={walletSheet.wallet}
            />
            <CategorySheet
                isOpen={categorySheet.open}
                onClose={() => setCategorySheet({ open: false })}
                onSaved={setNotice}
                category={categorySheet.category}
                defaultType={categorySheet.defaultType}
            />
            <BottomSheet
                isOpen={!!deleteTarget}
                onClose={() => {
                    if (!isDeleting) setDeleteTarget(null);
                }}
                title={deleteTarget?.kind === "wallet" ? "Delete wallet" : "Delete category"}
            >
                {deleteTarget && (
                    <div className="flex flex-col gap-4">
                        <p className="text-[var(--color-text-primary)]">
                            Delete <strong>{deleteTarget.kind === "wallet" ? deleteTarget.wallet.name : deleteTarget.category.name}</strong>?
                        </p>
                        <p className="settings-delete__note">
                            {deleteTarget.kind === "wallet"
                                ? "Only wallets without transactions can be deleted. If this is your default wallet, another wallet will become the default."
                                : "Its budgets will be deleted, and past transactions will become uncategorized."} This cannot be undone.
                        </p>
                        {deleteTarget.kind === "wallet" && deleteWallet.isError && (
                            <div role="alert" className="settings-delete__error">
                                <p>{walletDeleteError}</p>
                                {!walletDeleteBlocked && (
                                    <button type="button" data-sheet-no-dirty className="settings-text-button" onClick={() => { void refetchWallets(); setDeleteTarget(null); }}>
                                        Refresh wallets
                                    </button>
                                )}
                            </div>
                        )}
                        {deleteTarget.kind === "category" && deleteCategory.isError && (
                            <div role="alert" className="settings-delete__error">
                                <p>Could not confirm category deletion. Refresh the list before retrying.</p>
                                <button type="button" data-sheet-no-dirty className="settings-text-button" onClick={() => { void refetchCategories(); setDeleteTarget(null); }}>
                                    Refresh categories
                                </button>
                            </div>
                        )}
                        <div className="flex flex-wrap gap-2">
                            <button
                                type="button"
                                data-sheet-no-dirty
                                onClick={() => setDeleteTarget(null)}
                                disabled={isDeleting}
                                className="settings-pill"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                data-sheet-no-dirty
                                disabled={isDeleting || (deleteTarget.kind === "wallet" ? deleteWallet.isError : deleteCategory.isError)}
                                onClick={() => {
                                    if (deleteTarget.kind === "wallet") deleteWallet.mutate(deleteTarget.wallet.id);
                                    else deleteCategory.mutate(deleteTarget.category.id);
                                }}
                                className="settings-pill settings-pill--danger"
                            >
                                {isDeleting ? "Deleting…" : deleteTarget.kind === "wallet" ? "Delete wallet" : "Delete category"}
                            </button>
                        </div>
                    </div>
                )}
            </BottomSheet>
        </>
    );
}
