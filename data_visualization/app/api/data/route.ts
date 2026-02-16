import { readFile } from "fs/promises";
import { join } from "path";
import { NextResponse } from "next/server";

function parseCSV(text: string): Record<string, string | number>[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];
  const headers = lines[0].split(",").map((h) => h.trim());
  const rows: Record<string, string | number>[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const row: Record<string, string | number> = {};
    headers.forEach((h, j) => {
      const val = values[j];
      const num = Number(val);
      row[h] = val === "" ? "" : Number.isNaN(num) ? val : num;
    });
    rows.push(row);
  }
  return rows;
}

export async function GET() {
  try {
    const dataPath = join(process.cwd(), "..", "Datasets_merged", "merged_full_analysis_dataset.csv");
    const content = await readFile(dataPath, "utf-8");
    const data = parseCSV(content);
    return NextResponse.json(data);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to load data" }, { status: 500 });
  }
}
