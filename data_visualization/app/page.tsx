"use client";

import { useEffect, useState } from "react";
import { Sidebar, type ChartOrientation, type ScatterAxis } from "./components/Sidebar";
import { BarChart } from "./components/BarChart";
import { ScatterChart } from "./components/ScatterChart";

type DataRow = Record<string, string | number>;

/** Chart height as % of viewport so charts scale with page */
const CHART_HEIGHT_VH = 36;
const CHART_MIN_HEIGHT_PX = 280;

export default function Page() {
  const [data, setData] = useState<DataRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVariable, setSelectedVariable] = useState("Median Household Income");
  const [barOrientation, setBarOrientation] = useState<ChartOrientation>("vertical");
  const [scatterOrientation, setScatterOrientation] = useState<ChartOrientation>("vertical");
  const [scatterAxis, setScatterAxis] = useState<ScatterAxis>("x");
  const [secondVariable, setSecondVariable] = useState("Life Expectancy");

  useEffect(() => {
    fetch("/api/data")
      .then((res) => (res.ok ? res.json() : []))
      .then((rows: DataRow[]) => {
        setData(Array.isArray(rows) ? rows : []);
      })
      .catch(() => setData([]))
      .finally(() => setLoading(false));
  }, []);

  const scatterXKey = scatterAxis === "x" ? selectedVariable : secondVariable;
  const scatterYKey = scatterAxis === "y" ? selectedVariable : secondVariable;

  return (
    <div className="flex min-h-screen min-w-0 w-full flex-1 bg-slate-100 text-slate-800">
      <Sidebar
        selectedVariable={selectedVariable}
        onVariableChange={setSelectedVariable}
        barOrientation={barOrientation}
        onBarOrientationChange={setBarOrientation}
        scatterOrientation={scatterOrientation}
        onScatterOrientationChange={setScatterOrientation}
        scatterAxis={scatterAxis}
        onScatterAxisChange={setScatterAxis}
        secondVariable={secondVariable}
        onSecondVariableChange={setSecondVariable}
      />
      <main className="flex min-w-0 flex-1 flex-col overflow-auto p-6 md:p-8">
        <div className="flex w-full min-w-0 flex-1 flex-col gap-6 rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          <header className="shrink-0">
            <h1 className="text-2xl font-bold tracking-tight text-slate-800">
              County Health & Socioeconomic Dashboard
            </h1>
            <p className="mt-1.5 text-sm text-slate-500">
              Interactive analysis of fused County Health Rankings data · ~540 counties · 20+ quantitative attributes
            </p>
          </header>

          {loading ? (
            <div className="flex flex-1 items-center justify-center py-12 text-slate-500">
              Loading data…
            </div>
          ) : (
            <div className="flex w-full min-w-0 flex-1 flex-col gap-6">
              <div
                className="w-full flex-shrink-0 overflow-hidden"
                style={{
                  height: `max(${CHART_HEIGHT_VH}vh, ${CHART_MIN_HEIGHT_PX}px)`,
                  minHeight: CHART_MIN_HEIGHT_PX,
                }}
              >
                <BarChart
                  data={data}
                  variableKey={selectedVariable}
                  orientation={barOrientation}
                  title={`Distribution of ${selectedVariable}`}
                />
              </div>
              <div
                className="w-full flex-shrink-0 overflow-hidden"
                style={{
                  height: `max(${CHART_HEIGHT_VH}vh, ${CHART_MIN_HEIGHT_PX}px)`,
                  minHeight: CHART_MIN_HEIGHT_PX,
                }}
              >
                <ScatterChart
                  data={data}
                  xKey={scatterXKey}
                  yKey={scatterYKey}
                  title={`${scatterYKey} vs ${scatterXKey}`}
                />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
