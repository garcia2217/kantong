function SkeletonBlock({
  width = "100%",
  height,
  radius = "var(--radius-sm)",
}: {
  width?: string | number;
  height: number;
  radius?: string;
}) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius: radius,
        background: "var(--color-bg-hover)",
      }}
    />
  );
}

function StatCardSkeleton() {
  return (
    <div
      style={{
        background: "var(--color-bg-elevated)",
        border: "1px solid var(--color-border)",
        borderRadius: "var(--radius-lg)",
        padding: "var(--space-4) var(--space-5)",
        boxShadow: "0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.05)",
      }}
    >
      {/* Icon + label row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-2)",
          marginBottom: "var(--space-3)",
        }}
      >
        <SkeletonBlock width={28} height={28} radius="var(--radius-sm)" />
        <SkeletonBlock width="45%" height={10} />
      </div>
      {/* Value */}
      <SkeletonBlock width="65%" height={22} />
      {/* Subtext */}
      <div style={{ marginTop: "var(--space-2)" }}>
        <SkeletonBlock width="80%" height={10} />
      </div>
    </div>
  );
}

function TransactionRowSkeleton() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--space-3)",
        padding: "var(--space-3) var(--space-2)",
      }}
    >
      {/* Category icon */}
      <SkeletonBlock width={36} height={36} radius="var(--radius-md)" />

      {/* Description + date */}
      <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 6 }}>
        <SkeletonBlock width="55%" height={12} />
        <SkeletonBlock width="35%" height={10} />
      </div>

      {/* Amount */}
      <SkeletonBlock width={72} height={14} />
    </div>
  );
}

export default function DashboardLoading() {
  return (
    <>
      {/* Mobile sticky header skeleton */}
      <header
        className="md:hidden"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "var(--space-3) var(--space-4)",
          background: "var(--color-bg-app)",
          borderBottom: "0.5px solid var(--color-border)",
          minHeight: 52,
          margin: "calc(-1 * var(--space-4))",
          marginBottom: "var(--space-4)",
          width: "calc(100% + 2 * var(--space-4))",
        }}
      >
        <SkeletonBlock width={80} height={16} />
        <SkeletonBlock width={36} height={36} radius="var(--radius-md)" />
      </header>

      {/* Desktop page title skeleton */}
      <div
        className="hidden md:block"
        style={{ marginBottom: "var(--space-8)" }}
      >
        <SkeletonBlock width={120} height={28} radius="var(--radius-md)" />
      </div>

      {/* Stat card skeletons */}
      <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3"
        style={{ gap: "var(--space-3)", marginBottom: "var(--space-8)" }}
      >
        <StatCardSkeleton />
        <StatCardSkeleton />
        <StatCardSkeleton />
      </div>

      {/* Section divider skeleton */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-3)",
          marginBottom: "var(--space-3)",
        }}
      >
        <div style={{ flex: 1, height: "0.5px", background: "var(--color-border)" }} />
        <SkeletonBlock width={120} height={10} />
        <div style={{ flex: 1, height: "0.5px", background: "var(--color-border)" }} />
      </div>

      {/* Transaction row skeletons */}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--space-1)" }}>
        {Array.from({ length: 5 }).map((_, i) => (
          <TransactionRowSkeleton key={i} />
        ))}
      </div>
    </>
  );
}
