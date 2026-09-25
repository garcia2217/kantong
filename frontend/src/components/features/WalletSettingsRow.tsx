import { formatIDR } from "@/src/lib/utils/format";
import type { Wallet } from "@/src/types";

interface WalletSettingsRowProps {
  wallet: Wallet;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
  isDeleting: boolean;
  isSettingDefault: boolean;
}

const actionClass = "min-h-11 rounded-[var(--radius-md)] px-3 text-[var(--text-sm)] font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]";

export function WalletSettingsRow({
  wallet,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
}: WalletSettingsRowProps) {
  return (
    <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="break-words font-medium text-[var(--color-text-primary)]">{wallet.name}</p>
          {wallet.is_default && (
            <span className="rounded-full bg-[var(--color-positive-bg)] px-2 py-0.5 text-[var(--text-xs)] font-medium text-[var(--color-positive)]">
              Default
            </span>
          )}
        </div>
        <p className="mt-1 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          Current balance · {formatIDR(wallet.balance)}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-1 sm:justify-end">
        {!wallet.is_default && (
          <button
            type="button"
            className={`${actionClass} text-[var(--color-accent)] underline disabled:opacity-50`}
            onClick={onSetDefault}
            disabled={isSettingDefault || isDeleting}
            aria-label={`Set ${wallet.name} as default wallet`}
          >
            {isSettingDefault ? "Setting…" : "Set as default"}
          </button>
        )}
        <button
          type="button"
          className={`${actionClass} text-[var(--color-text-primary)] underline`}
          onClick={onEdit}
          aria-label={`Edit ${wallet.name}`}
        >
          Edit
        </button>
        <button
          type="button"
          className={`${actionClass} text-[var(--color-negative)] underline disabled:opacity-50`}
          onClick={onDelete}
          disabled={isDeleting || isSettingDefault}
          aria-label={`Delete ${wallet.name}`}
        >
          {isDeleting ? "Deleting…" : "Delete"}
        </button>
      </div>
    </div>
  );
}
