"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export interface ScatterChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  yKey: string;
  width?: number;
  height?: number;
  title?: string;
}

const MARGIN = { top: 40, right: 40, bottom: 90, left: 80 };
const CHROME_X = 40;
const CHROME_Y = 76;

function formatTick(val: number, key: string): string {
  if (key.includes("Income") || key.includes("Population")) {
    if (val >= 1000) return `$${Math.round(val / 1000)}k`;
    return `$${val}`;
  }
  return String(Math.round(val));
}

export function ScatterChart({
  data,
  xKey,
  yKey,
  width: widthProp = 720,
  height: heightProp = 420,
  title,
}: ScatterChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [size, setSize] = useState({ width: widthProp, height: heightProp });
  const [tooltip, setTooltip] = useState<{
    x: number;
    y: number;
    text: string;
  } | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver((entries) => {
      const { width: cw, height: ch } = entries[0]?.contentRect ?? {};
      if (typeof cw === "number" && typeof ch === "number" && cw > CHROME_X && ch > CHROME_Y) {
        setSize({ width: Math.floor(cw - CHROME_X), height: Math.floor(ch - CHROME_Y) });
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const width = size.width;
  const height = size.height;

  const { points, xScale, yScale, trendLine } = useMemo(() => {
    const pts = data
      .map((d) => ({
        x: Number(d[xKey]),
        y: Number(d[yKey]),
        county: String(d["County"] ?? ""),
        state: String(d["State"] ?? ""),
      }))
      .filter((p) => Number.isFinite(p.x) && Number.isFinite(p.y));

    if (pts.length === 0) {
      return { points: [], xScale: null, yScale: null, trendLine: [] };
    }

    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const xExtent = d3.extent(pts, (p) => p.x) as [number, number];
    const yExtent = d3.extent(pts, (p) => p.y) as [number, number];

    const xScale = d3
      .scaleLinear()
      .domain(xExtent)
      .nice()
      .range([0, innerWidth]);

    const yScale = d3
      .scaleLinear()
      .domain(yExtent)
      .nice()
      .range([innerHeight, 0]);

    /* 🔥 Linear regression */
    const n = pts.length;
    const sumX = d3.sum(pts, (p) => p.x);
    const sumY = d3.sum(pts, (p) => p.y);
    const sumXY = d3.sum(pts, (p) => p.x * p.y);
    const sumXX = d3.sum(pts, (p) => p.x * p.x);

    const slope =
      (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX || 1);
    const intercept = (sumY - slope * sumX) / n;

    const trendLine: [number, number][] = [
      [xExtent[0], slope * xExtent[0] + intercept],
      [xExtent[1], slope * xExtent[1] + intercept],
    ];

    return { points: pts, xScale, yScale, trendLine };
  }, [data, xKey, yKey, width, height]);

  useEffect(() => {
    if (!gRef.current || !xScale || !yScale || points.length === 0) return;

    const g = d3.select(gRef.current);
    g.selectAll("*").remove();

    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    /* 🔥 X Axis */
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(xScale).tickFormat((d) =>
          formatTick(Number(d), xKey)
        )
      )
      .selectAll("text")
      .attr("fill", "#475569")
      .attr("font-size", 11);

    /* 🔥 Y Axis */
    g.append("g")
      .call(
        d3.axisLeft(yScale).tickFormat((d) =>
          formatTick(Number(d), yKey)
        )
      )
      .selectAll("text")
      .attr("fill", "#475569")
      .attr("font-size", 11);

    g.selectAll(".domain, .tick line").attr("stroke", "#64748b");

    /* 🔥 Trend Line */
    const lineGen = d3
      .line<[number, number]>()
      .x((d) => xScale(d[0]))
      .y((d) => yScale(d[1]));

    g.append("path")
      .datum(trendLine)
      .attr("fill", "none")
      .attr("stroke", "#64748b")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4,4")
      .attr("d", lineGen);

    /* 🔥 Points */
    g.selectAll("circle")
      .data(points)
      .join("circle")
      .attr("cx", (d) => xScale(d.x))
      .attr("cy", (d) => yScale(d.y))
      .attr("r", 4)
      .attr("fill", "#3b82f6")
      .attr("opacity", 0.75)
      .on("mouseenter", (event, d) => {
        setTooltip({
          x: event.pageX,
          y: event.pageY,
          text: `${d.county}, ${d.state}
${xKey}: ${formatTick(d.x, xKey)}
${yKey}: ${formatTick(d.y, yKey)}`,
        });
      })
      .on("mouseleave", () => setTooltip(null));

    /* 🔥 Axis Labels */
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 60)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", 13)
      .text(xKey + (xKey.includes("Income") ? " ($)" : ""));

    g.append("text")
      .attr("x", -innerHeight / 2)
      .attr("y", -55)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", 13)
      .attr("transform", "rotate(-90)")
      .text(yKey);
  }, [points, xScale, yScale, trendLine, width, height, xKey, yKey]);

  if (points.length === 0) {
    return (
      <div className="h-full w-full min-h-0 min-w-0 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
        {title && (
          <h3 className="mb-3 text-base font-semibold text-slate-800">
            {title}
          </h3>
        )}
        <p className="text-slate-500">
          No data for {xKey} vs {yKey}
        </p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-0 min-w-0 rounded-xl border border-slate-200 bg-slate-50/50 p-5 relative"
    >
      {title && (
        <h3 className="mb-3 text-base font-semibold text-slate-800">
          {title}
        </h3>
      )}
      <svg
        width={width}
        height={height}
        className="max-w-full overflow-visible"
        style={{ display: "block" }}
      >
        <g
          ref={gRef}
          transform={`translate(${MARGIN.left},${MARGIN.top})`}
        />
      </svg>

      {tooltip && (
        <div
          className="pointer-events-none fixed z-50 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-lg whitespace-pre-line"
          style={{
            left: tooltip.x + 12,
            top: tooltip.y + 12,
          }}
        >
          {tooltip.text}
        </div>
      )}
    </div>
  );
}
