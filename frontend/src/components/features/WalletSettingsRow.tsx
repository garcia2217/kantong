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

export function WalletSettingsRow({
  wallet,
  onEdit,
  onDelete,
  onSetDefault,
  isDeleting,
  isSettingDefault,
}: WalletSettingsRowProps) {
  return (
    <div className="settings-row">
      <span className="settings-row__icon" aria-hidden="true">👛</span>
      <div className="settings-row__body">
        <div className="settings-row__name-line">
          <p className="settings-row__name">{wallet.name}</p>
          {wallet.is_default && <span className="settings-badge">Default</span>}
        </div>
        <p className="settings-row__meta">
          <span className="sr-only">Current balance </span>
          <span className="settings-row__balance">{formatIDR(wallet.balance)}</span>
        </p>
      </div>
      <div className="settings-row__actions">
        {!wallet.is_default && (
          <button
            type="button"
            className="settings-pill"
            onClick={onSetDefault}
            disabled={isSettingDefault || isDeleting}
            aria-label={`Set ${wallet.name} as default wallet`}
          >
            {isSettingDefault ? "Setting…" : "Make default"}
          </button>
        )}
        <button
          type="button"
          className="settings-pill settings-pill--ghost"
          onClick={onEdit}
          aria-label={`Edit ${wallet.name}`}
        >
          Edit
        </button>
        <button
          type="button"
          className="settings-pill settings-pill--ghost settings-pill--danger-text"
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
