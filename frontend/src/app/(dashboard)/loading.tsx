const ROW_COUNT = 4;

// Mirrors the shared page shape (title, forest summary panel, list card) so
// the switch from loading to content doesn't jump.
export default function DashboardLoading() {
  return (
    <div className="app-loading" role="status" aria-label="Loading page">
      <span className="app-skeleton app-skeleton--title" />
      <div className="app-loading__panel">
        <span className="app-skeleton app-skeleton--on-panel app-skeleton--label" />
        <span className="app-skeleton app-skeleton--on-panel app-skeleton--value" />
      </div>
      <div className="app-loading__card">
        {Array.from({ length: ROW_COUNT }).map((_, i) => (
          <div key={i} className="app-loading__row">
            <span className="app-skeleton app-skeleton--icon" />
            <span className="app-loading__lines">
              <span className="app-skeleton app-skeleton--line" />
              <span className="app-skeleton app-skeleton--line-short" />
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
