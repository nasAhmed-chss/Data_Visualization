"use client";

export type ChartOrientation = "vertical" | "horizontal";
export type ScatterAxis = "x" | "y";

export const VARIABLE_OPTIONS = [
  "Median Household Income",
  "Life Expectancy",
  "% Fair or Poor Health",
  "% Unemployed",
  "% Children in Poverty",
  "Years of Potential Life Lost Rate",
  "Average Number of Physically Unhealthy Days",
  "Average Number of Mentally Unhealthy Days",
  "Primary Care Physicians Rate",
  "% Uninsured",
  "Income Ratio",
  "Drug Overdose Mortality Rate",
  "High School Graduation Rate",
  "% Adults with Obesity",
  "% Adults Reporting Currently Smoking",
  "% Rural",
  "Population",
] as const;

export interface SidebarProps {
  selectedVariable: string;
  onVariableChange: (v: string) => void;
  barOrientation: ChartOrientation;
  onBarOrientationChange: (o: ChartOrientation) => void;
  scatterOrientation: ChartOrientation;
  onScatterOrientationChange: (o: ChartOrientation) => void;
  scatterAxis: ScatterAxis;
  onScatterAxisChange: (a: ScatterAxis) => void;
  secondVariable: string;
  onSecondVariableChange: (v: string) => void;
}

export function Sidebar({
  selectedVariable,
  onVariableChange,
  barOrientation,
  onBarOrientationChange,
  scatterOrientation,
  onScatterOrientationChange,
  scatterAxis,
  onScatterAxisChange,
  secondVariable,
  onSecondVariableChange,
}: SidebarProps) {
  const secondOptions = VARIABLE_OPTIONS.filter((v) => v !== selectedVariable);

  return (
    <aside className="flex w-60 shrink-0 flex-col gap-5 border-r border-slate-200 bg-slate-50/80 p-4 text-slate-700">
      <div>
        <h2 className="text-lg font-semibold text-slate-800">CSE 564</h2>
        <button
          type="button"
          className="mt-1 flex w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-left text-sm text-slate-600 shadow-sm hover:bg-slate-50"
          aria-expanded="false"
        >
          <span>- Visualization & Visual Analytics</span>
          <svg className="size-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      <section className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Select Variable
        </label>
        <div className="flex flex-wrap gap-2">
          {VARIABLE_OPTIONS.slice(0, 6).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => onVariableChange(v)}
              className={`rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                selectedVariable === v
                  ? "border-sky-400 bg-sky-50 text-sky-700"
                  : "border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
        <select
          value={selectedVariable}
          onChange={(e) => onVariableChange(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          {VARIABLE_OPTIONS.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Chart Orientation
        </label>
        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="bar-orientation"
              checked={barOrientation === "vertical"}
              onChange={() => onBarOrientationChange("vertical")}
              className="size-4 border-slate-300 text-sky-500 focus:ring-sky-400"
            />
            <span className="text-sm text-slate-600">Vertical</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="bar-orientation"
              checked={barOrientation === "horizontal"}
              onChange={() => onBarOrientationChange("horizontal")}
              className="size-4 border-slate-300 text-sky-500 focus:ring-sky-400"
            />
            <span className="text-sm text-slate-600">Horizontal</span>
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Chart Orientation
        </label>
        <div className="flex gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="scatter-orientation"
              checked={scatterOrientation === "vertical"}
              onChange={() => onScatterOrientationChange("vertical")}
              className="size-4 border-slate-300 text-sky-500 focus:ring-sky-400"
            />
            <span className="text-sm text-slate-600">Vertical</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="scatter-orientation"
              checked={scatterOrientation === "horizontal"}
              onChange={() => onScatterOrientationChange("horizontal")}
              className="size-4 border-slate-300 text-sky-500 focus:ring-sky-400"
            />
            <span className="text-sm text-slate-600">Horizontal</span>
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Scatterplot Axis Assignment
        </label>
        <div className="flex flex-col gap-2">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="scatter-axis"
              checked={scatterAxis === "x"}
              onChange={() => onScatterAxisChange("x")}
              className="size-4 border-slate-300 text-sky-500 focus:ring-sky-400"
            />
            <span className="text-sm text-slate-600">Selected variable - X-axis</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="radio"
              name="scatter-axis"
              checked={scatterAxis === "y"}
              onChange={() => onScatterAxisChange("y")}
              className="size-4 border-slate-300 text-sky-500 focus:ring-sky-400"
            />
            <span className="text-sm text-slate-600">Selected variable - Y-axis</span>
          </label>
        </div>
      </section>

      <section className="flex flex-col gap-2">
        <label className="text-xs font-medium uppercase tracking-wider text-slate-500">
          Select Second Variable
        </label>
        <select
          value={secondVariable}
          onChange={(e) => onSecondVariableChange(e.target.value)}
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-sky-400 focus:outline-none focus:ring-1 focus:ring-sky-400"
        >
          {secondOptions.map((v) => (
            <option key={v} value={v}>
              {v}
            </option>
          ))}
        </select>
      </section>
    </aside>
  );
}
