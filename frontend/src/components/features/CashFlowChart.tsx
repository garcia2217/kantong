"use client";

import { useEffect, useRef, useState } from "react";
import { formatIDR, formatIDRCompact } from "@/src/lib/utils/format";
import type { DashboardCashFlowPoint } from "@/src/lib/mock/mock-dashboard";

interface CashFlowChartProps {
  data: DashboardCashFlowPoint[];
}

interface ChartLayout {
  width: number;
  height: number;
  padding: { top: number; right: number; bottom: number; left: number };
}

const DEFAULT_WIDTH = 640;
const NARROW_BREAKPOINT = 480;
const LABEL_SIZE = 12;

// The viewBox is matched to the rendered width, so one SVG unit is one CSS
// pixel and the axis labels stay at LABEL_SIZE on every screen instead of
// shrinking with the chart.
function layoutFor(width: number): ChartLayout {
  const isNarrow = width < NARROW_BREAKPOINT;
  return {
    width,
    height: isNarrow ? 220 : 260,
    padding: isNarrow
      ? { top: 16, right: 20, bottom: 34, left: 44 }
      : { top: 20, right: 24, bottom: 38, left: 58 },
  };
}

const roundUpToMillion = (value: number): number =>
  Math.max(1_000_000, Math.ceil(value / 1_000_000) * 1_000_000);

interface ChartSvgProps {
  data: DashboardCashFlowPoint[];
  layout: ChartLayout;
}

function ChartSvg({ data, layout }: ChartSvgProps) {
  const { width, height, padding } = layout;
  const plotWidth = width - padding.left - padding.right;
  const plotHeight = height - padding.top - padding.bottom;
  const maximum = roundUpToMillion(
    Math.max(...data.flatMap((point) => [point.income, point.expenses])),
  );
  const yTicks = [maximum, maximum / 2, 0];
  const xAt = (index: number): number =>
    padding.left + (data.length === 1 ? plotWidth / 2 : (index / (data.length - 1)) * plotWidth);
  const yAt = (value: number): number => padding.top + plotHeight - (value / maximum) * plotHeight;
  const toPath = (key: "income" | "expenses"): string =>
    data
      .map((point, index) => `${index === 0 ? "M" : "L"} ${xAt(index).toFixed(2)} ${yAt(point[key]).toFixed(2)}`)
      .join(" ");
  const titleId = "cash-flow-chart-title";
  const descriptionId = "cash-flow-chart-description";

  return (
    <svg
      role="img"
      aria-labelledby={`${titleId} ${descriptionId}`}
      viewBox={`0 0 ${width} ${height}`}
      className="cash-flow-chart__svg"
    >
      <title id={titleId}>Income and expenses over six months</title>
      <desc id={descriptionId}>
        A line chart comparing monthly income and expenses. Income is a solid
        line with circular markers. Expenses are a dashed line with square
        markers.
      </desc>

      {yTicks.map((tick) => {
        const y = yAt(tick);
        return (
          <g key={tick}>
            <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--color-border)" strokeWidth="1" />
            <text x={padding.left - 8} y={y + 4} textAnchor="end" fill="var(--color-text-secondary)" fontSize={LABEL_SIZE}>
              {tick === 0 ? "Rp 0" : formatIDRCompact(tick).replace("Rp ", "")}
            </text>
          </g>
        );
      })}

      {data.map((point, index) => (
        <text
          key={point.month}
          x={xAt(index)}
          y={height - 12}
          textAnchor="middle"
          fill="var(--color-text-secondary)"
          fontSize={LABEL_SIZE}
        >
          {point.month}
        </text>
      ))}

      <path
        d={toPath("income")}
        fill="none"
        stroke="var(--color-positive)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
      <path
        d={toPath("expenses")}
        fill="none"
        stroke="var(--color-negative)"
        strokeWidth="3"
        strokeDasharray="7 6"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />

      {data.map((point, index) => {
        const x = xAt(index);
        const incomeY = yAt(point.income);
        const expenseY = yAt(point.expenses);
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
  );
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(DEFAULT_WIDTH);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      const measured = Math.round(entry.contentRect.width);
      if (measured > 0) setWidth(measured);
    });
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  if (data.length === 0) {
    return <div className="cash-flow-chart__empty">No cash-flow data available yet.</div>;
  }

  return (
    <figure className="cash-flow-chart">
      <div aria-hidden="true" className="cash-flow-chart__legend">
        <span className="cash-flow-chart__key">
          <span className="cash-flow-chart__swatch" />
          Income
        </span>
        <span className="cash-flow-chart__key">
          <svg width="18" height="4" viewBox="0 0 18 4">
            <line x1="0" y1="2" x2="18" y2="2" stroke="var(--color-negative)" strokeWidth="3" strokeDasharray="4 3" />
          </svg>
          Expenses
        </span>
      </div>

      <div ref={containerRef}>
        <ChartSvg data={data} layout={layoutFor(width)} />
      </div>

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
