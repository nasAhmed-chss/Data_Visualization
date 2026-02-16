"use client";

import { useMemo, useRef, useEffect, useState } from "react";
import * as d3 from "d3";

export interface BarChartProps {
  data: Record<string, string | number>[];
  variableKey: string;
  orientation?: "vertical" | "horizontal";
  width?: number;
  height?: number;
  title?: string;
}

const MARGIN = { top: 40, right: 40, bottom: 120, left: 80 };
const DEFAULT_BINS = 12;
/** Space taken by padding (p-5) and title (mb-3 + line): use for container-based SVG size */
const CHROME_X = 40;
const CHROME_Y = 76;

function formatAxisValue(val: number, key: string): string {
  if (key.includes("Income") || key.includes("Population")) {
    if (val >= 1000) return `$${Math.round(val / 1000)}k`;
    return `$${val}`;
  }
  return String(Math.round(val));
}

export function BarChart({
  data,
  variableKey,
  orientation = "vertical",
  width: widthProp = 720,
  height: heightProp = 450,
  title,
}: BarChartProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const [size, setSize] = useState({ width: widthProp, height: heightProp });

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

  const { buckets, xScale, yScale, xTicks } = useMemo(() => {
    const values = data
      .map((d) => Number(d[variableKey]))
      .filter((n) => Number.isFinite(n));

    if (values.length === 0) {
      return { buckets: [], xScale: null, yScale: null, xTicks: [] };
    }

    const min = Math.min(...values);
    const max = Math.max(...values);
    const extent = max - min || 1;
    const step = extent / DEFAULT_BINS;

    const bucketMap = new Map<string, number>();

    for (let i = 0; i < DEFAULT_BINS; i++) {
      const lo = min + i * step;
      const hi = lo + step;
      const label = `${formatAxisValue(lo, variableKey)}-${formatAxisValue(
        hi,
        variableKey
      )}`;
      bucketMap.set(label, 0);
    }

    values.forEach((v) => {
      const idx = Math.min(
        Math.floor((v - min) / step),
        DEFAULT_BINS - 1
      );
      const lo = min + idx * step;
      const hi = lo + step;
      const label = `${formatAxisValue(lo, variableKey)}-${formatAxisValue(
        hi,
        variableKey
      )}`;
      bucketMap.set(label, (bucketMap.get(label) ?? 0) + 1);
    });

    const buckets = Array.from(bucketMap.entries()).map(
      ([label, count]) => ({ label, count })
    );

    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    const xScale = d3
      .scaleBand()
      .domain(buckets.map((b) => b.label))
      .range([0, innerWidth])
      .padding(0.25);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(buckets, (d) => d.count) ?? 1])
      .range([innerHeight, 0]);

    return {
      buckets,
      xScale,
      yScale,
      xTicks: buckets.map((b) => b.label),
    };
  }, [data, variableKey, width, height]);

  useEffect(() => {
    if (!gRef.current || !xScale || !yScale || buckets.length === 0)
      return;

    const g = d3.select(gRef.current);
    g.selectAll("*").remove();

    const innerWidth = width - MARGIN.left - MARGIN.right;
    const innerHeight = height - MARGIN.top - MARGIN.bottom;

    // X Axis
    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("fill", "#475569")
      .attr("font-size", "11px")
      .attr("transform", "rotate(-25)")
      .style("text-anchor", "end");

    // Y Axis
    g.append("g")
      .call(d3.axisLeft(yScale).ticks(6))
      .selectAll("text")
      .attr("fill", "#475569");

    g.selectAll(".domain, .tick line").attr("stroke", "#64748b");

    // Bars
    g.selectAll(".bar")
      .data(buckets)
      .join("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.label) ?? 0)
      .attr("y", (d) => yScale(d.count))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.count))
      .attr("fill", "#3b82f6")
      .attr("opacity", 0.9);

    // X Label
    g.append("text")
      .attr("x", innerWidth / 2)
      .attr("y", innerHeight + 80)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", 13)
      .text(variableKey);

    // Y Label
    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -innerHeight / 2)
      .attr("y", -55)
      .attr("text-anchor", "middle")
      .attr("fill", "#475569")
      .attr("font-size", 13)
      .text("Number of Counties");
  }, [buckets, xScale, yScale, width, height, variableKey]);

  if (buckets.length === 0) {
    return (
      <div className="h-full w-full min-h-0 min-w-0 rounded-xl border border-slate-200 bg-slate-50/50 p-5">
        {title && (
          <h3 className="mb-3 text-base font-semibold text-slate-800">
            {title}
          </h3>
        )}
        <p className="text-slate-500">No data for {variableKey}</p>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="h-full w-full min-h-0 min-w-0 rounded-xl border border-slate-200 bg-slate-50/50 p-5"
    >
      {title && (
        <h3 className="mb-3 text-base font-semibold text-slate-800">
          {title}
        </h3>
      )}
      <svg
        ref={svgRef}
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
    </div>
  );
}
