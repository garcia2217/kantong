import { formatIDR } from "@/src/lib/utils/format";
import type { DashboardCategorySpend } from "@/src/lib/mock/mock-dashboard";

interface SpendingBreakdownChartProps {
  data: DashboardCategorySpend[];
}

const CHART_SIZE = 220;
const CHART_CENTER = CHART_SIZE / 2;
const CHART_RADIUS = 76;
const STROKE_WIDTH = 28;

export function SpendingBreakdownChart({ data }: SpendingBreakdownChartProps) {
  const total = data.reduce((sum, category) => sum + category.amount, 0);

  if (data.length === 0 || total <= 0) {
    return (
      <div
        style={{
          minHeight: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--color-text-secondary)",
          fontSize: "var(--text-sm)",
        }}
      >
        No spending data available yet.
      </div>
    );
  }

  const categories = data.map((category) => ({
    ...category,
    calculatedPercentage: (category.amount / total) * 100,
  }));
  const largestCategory = categories.reduce((largest, category) =>
    category.amount > largest.amount ? category : largest,
  );
  const categoriesWithOffset = categories.map((category, index) => ({
    ...category,
    startOffset: categories
      .slice(0, index)
      .reduce((sum, previousCategory) => sum + previousCategory.calculatedPercentage, 0),
  }));

  return (
    <figure style={{ margin: 0 }}>
      <svg
        role="img"
        aria-label={`Spending breakdown. ${largestCategory.name} is the largest category at ${largestCategory.calculatedPercentage.toFixed(1)} percent.`}
        viewBox={`0 0 ${CHART_SIZE} ${CHART_SIZE}`}
        style={{ display: "block", width: "100%", maxWidth: 240, height: "auto", margin: "0 auto" }}
      >
        <circle
          cx={CHART_CENTER}
          cy={CHART_CENTER}
          r={CHART_RADIUS}
          fill="none"
          stroke="var(--color-bg-subtle)"
          strokeWidth={STROKE_WIDTH}
        />

        <g transform={`rotate(-90 ${CHART_CENTER} ${CHART_CENTER})`}>
          {categoriesWithOffset.map((category) => (
            <circle
              key={category.id}
              cx={CHART_CENTER}
              cy={CHART_CENTER}
              r={CHART_RADIUS}
              pathLength="100"
              fill="none"
              stroke={category.color}
              strokeWidth={STROKE_WIDTH}
              strokeDasharray={`${category.calculatedPercentage} ${100 - category.calculatedPercentage}`}
              strokeDashoffset={-category.startOffset}
              strokeLinecap="butt"
            />
          ))}
        </g>

        <text
          x={CHART_CENTER}
          y={CHART_CENTER - 13}
          textAnchor="middle"
          fill="var(--color-text-secondary)"
          fontSize="11"
          fontWeight="500"
        >
          Largest category
        </text>
        <text
          x={CHART_CENTER}
          y={CHART_CENTER + 7}
          textAnchor="middle"
          fill="var(--color-text-primary)"
          fontSize="15"
          fontWeight="600"
        >
          {largestCategory.name}
        </text>
        <text
          x={CHART_CENTER}
          y={CHART_CENTER + 27}
          textAnchor="middle"
          fill="var(--color-text-secondary)"
          fontSize="12"
        >
          {largestCategory.calculatedPercentage.toFixed(1)}%
        </text>
      </svg>

      <figcaption className="sr-only">
        Total spending is {formatIDR(total)}. {categories.map((category) => (
          <span key={`${category.id}-summary`}>
            {category.name}: {formatIDR(category.amount)}, {category.calculatedPercentage.toFixed(1)}%.{" "}
          </span>
        ))}
      </figcaption>
    </figure>
  );
}
