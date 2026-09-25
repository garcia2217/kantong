import type { Category, CategoryType } from "@/src/types";

interface CategorySettingsGroupProps {
  type: CategoryType;
  categories: Category[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  deletingId?: string;
}

const actionClass = "min-h-11 rounded-[var(--radius-md)] px-3 text-[var(--text-sm)] font-medium underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]";

export function CategorySettingsGroup({
  type,
  categories,
  onAdd,
  onEdit,
  onDelete,
  deletingId,
}: CategorySettingsGroupProps) {
  const title = type === "income" ? "Income" : "Expense";

  return (
    <section aria-label={`${title} categories`} className="border-t border-[var(--color-border)]">
      <div className="flex flex-wrap items-center justify-between gap-2 bg-[var(--color-bg-subtle)] px-4 py-2">
        <h3 className="text-[var(--text-sm)] font-semibold text-[var(--color-text-primary)]">
          {title} <span className="font-normal text-[var(--color-text-secondary)]">({categories.length})</span>
        </h3>
        <button
          type="button"
          className="min-h-11 rounded-[var(--radius-md)] px-3 text-[var(--text-sm)] font-medium text-[var(--color-accent)] underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          onClick={onAdd}
        >
          Add {type.toLowerCase()}
        </button>
      </div>
      {categories.length === 0 ? (
        <p className="px-4 py-4 text-[var(--text-sm)] text-[var(--color-text-secondary)]">
          No {type} categories yet.
        </p>
      ) : (
        categories.map((category) => (
          <div key={category.id} className="flex flex-wrap items-center justify-between gap-2 border-t border-[var(--color-border)] px-4 py-2">
            <div className="min-w-0">
              <p className="break-words font-medium text-[var(--color-text-primary)]">{category.name}</p>
              {category.user_id === null && (
                <p className="text-[var(--text-sm)] text-[var(--color-text-secondary)]">Built-in category</p>
              )}
            </div>
            {category.user_id !== null && (
              <div className="flex flex-wrap gap-1">
                <button
                  type="button"
                  className={`${actionClass} text-[var(--color-text-primary)]`}
                  onClick={() => onEdit(category)}
                  aria-label={`Edit ${category.name} ${type} category`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className={`${actionClass} text-[var(--color-negative)] disabled:opacity-50`}
                  onClick={() => onDelete(category)}
                  disabled={deletingId === category.id}
                  aria-label={`Delete ${category.name} ${type} category`}
                >
                  {deletingId === category.id ? "Deleting…" : "Delete"}
                </button>
              </div>
            )}
          </div>
        ))
      )}
    </section>
  );
}
