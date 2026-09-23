import { formatIDR, formatIDRCompact } from "@/src/lib/utils/format";
import type { DashboardCashFlowPoint } from "@/src/lib/mock/mock-dashboard";

interface CashFlowChartProps {
  data: DashboardCashFlowPoint[];
}

const CHART_WIDTH = 640;
const CHART_HEIGHT = 260;
const PADDING = {
  top: 20,
  right: 18,
  bottom: 38,
  left: 58,
};

const plotWidth = CHART_WIDTH - PADDING.left - PADDING.right;
const plotHeight = CHART_HEIGHT - PADDING.top - PADDING.bottom;

const roundUpToMillion = (value: number): number =>
  Math.max(1_000_000, Math.ceil(value / 1_000_000) * 1_000_000);

const toPath = (
  data: DashboardCashFlowPoint[],
  key: "income" | "expenses",
  maximum: number,
): string =>
  data
    .map((point, index) => {
      const x =
        PADDING.left +
        (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
      const y = PADDING.top + plotHeight - (point[key] / maximum) * plotHeight;
      return `${index === 0 ? "M" : "L"} ${x.toFixed(2)} ${y.toFixed(2)}`;
    })
    .join(" ");

export function CashFlowChart({ data }: CashFlowChartProps) {
  if (data.length === 0) {
    return (
      <div
        style={{
          minHeight: 260,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-secondary)",
          fontSize: "var(--text-sm)",
        }}
      >
        No cash-flow data available yet.
      </div>
    );
  }

  const maximum = roundUpToMillion(
    Math.max(...data.flatMap((point) => [point.income, point.expenses])),
  );
  const yTicks = [maximum, maximum / 2, 0];
  const incomePath = toPath(data, "income", maximum);
  const expensePath = toPath(data, "expenses", maximum);

  return (
    <figure style={{ margin: 0 }}>
      <div
        aria-hidden="true"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "var(--space-4)",
          marginBottom: "var(--space-3)",
          color: "var(--color-text-secondary)",
          fontSize: "var(--text-xs)",
        }}
      >
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <span
            style={{
              width: 18,
              height: 3,
              borderRadius: 2,
              background: "var(--color-positive)",
            }}
          />
          Income
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: "var(--space-2)" }}>
          <svg width="18" height="4" viewBox="0 0 18 4">
            <line
              x1="0"
              y1="2"
              x2="18"
              y2="2"
              stroke="var(--color-negative)"
              strokeWidth="3"
              strokeDasharray="4 3"
            />
          </svg>
          Expenses
        </span>
      </div>

      <svg
        role="img"
        aria-labelledby="cash-flow-chart-title cash-flow-chart-description"
        viewBox={`0 0 ${CHART_WIDTH} ${CHART_HEIGHT}`}
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <title id="cash-flow-chart-title">Income and expenses over six months</title>
        <desc id="cash-flow-chart-description">
          A line chart comparing monthly income and expenses. Income is a solid
          line with circular markers. Expenses are a dashed line with square
          markers.
        </desc>

        {yTicks.map((tick) => {
          const y = PADDING.top + plotHeight - (tick / maximum) * plotHeight;
          return (
            <g key={tick}>
              <line
                x1={PADDING.left}
                y1={y}
                x2={CHART_WIDTH - PADDING.right}
                y2={y}
                stroke="var(--color-border)"
                strokeWidth="1"
              />
              <text
                x={PADDING.left - 10}
                y={y + 4}
                textAnchor="end"
                fill="var(--color-text-secondary)"
                fontSize="11"
              >
                {tick === 0 ? "Rp 0" : formatIDRCompact(tick).replace("Rp ", "")}
              </text>
            </g>
          );
        })}

        {data.map((point, index) => {
          const x =
            PADDING.left +
            (data.length === 1
              ? plotWidth / 2
              : (index / (data.length - 1)) * plotWidth);
          return (
            <text
              key={point.month}
              x={x}
              y={CHART_HEIGHT - 12}
              textAnchor="middle"
              fill="var(--color-text-secondary)"
              fontSize="11"
            >
              {point.month}
            </text>
          );
        })}

        <path
          d={incomePath}
          fill="none"
          stroke="var(--color-positive)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />
        <path
          d={expensePath}
          fill="none"
          stroke="var(--color-negative)"
          strokeWidth="3"
          strokeDasharray="7 6"
          strokeLinecap="round"
          strokeLinejoin="round"
          vectorEffect="non-scaling-stroke"
        />

        {data.map((point, index) => {
          const x =
            PADDING.left +
            (data.length === 1
              ? plotWidth / 2
              : (index / (data.length - 1)) * plotWidth);
          const incomeY =
            PADDING.top + plotHeight - (point.income / maximum) * plotHeight;
          const expenseY =
            PADDING.top + plotHeight - (point.expenses / maximum) * plotHeight;

          return (
            <g key={`${point.month}-markers`}>
              <circle
                cx={x}
                cy={incomeY}
                r="4"
                fill="var(--color-bg-elevated)"
                stroke="var(--color-positive)"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
              <rect
                x={x - 4}
                y={expenseY - 4}
                width="8"
                height="8"
                rx="1"
                fill="var(--color-bg-elevated)"
                stroke="var(--color-negative)"
                strokeWidth="3"
                vectorEffect="non-scaling-stroke"
              />
            </g>
          );
        })}
      </svg>

      <figcaption className="sr-only">
        {data.map((point) => (
          <span key={`${point.month}-summary`}>
            {point.month}: income {formatIDR(point.income)}, expenses{" "}
            {formatIDR(point.expenses)}. {" "}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
