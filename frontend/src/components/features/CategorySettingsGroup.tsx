import type { Category, CategoryType } from "@/src/types";

interface CategorySettingsGroupProps {
  type: CategoryType;
  categories: Category[];
  onAdd: () => void;
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  deletingId?: string;
}

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
    <section aria-label={`${title} categories`} className="settings-group">
      <div className="settings-group__head">
        <h3 className="settings-group__title">
          {title} <span className="settings-group__count">({categories.length})</span>
        </h3>
        <button type="button" className="settings-pill settings-pill--ghost settings-pill--accent" onClick={onAdd}>
          <span aria-hidden="true">＋</span> Add {type.toLowerCase()}
        </button>
      </div>
      {categories.length === 0 ? (
        <p className="settings-group__empty">No {type} categories yet.</p>
      ) : (
        categories.map((category) => (
          <div key={category.id} className="settings-category">
            <p className="settings-category__name">{category.name}</p>
            {category.user_id === null ? (
              <span className="settings-badge settings-badge--muted">Built-in</span>
            ) : (
              <div className="settings-category__actions">
                <button
                  type="button"
                  className="settings-pill settings-pill--ghost"
                  onClick={() => onEdit(category)}
                  aria-label={`Edit ${category.name} ${type} category`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="settings-pill settings-pill--ghost settings-pill--danger-text"
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
