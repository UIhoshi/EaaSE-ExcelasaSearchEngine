import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import XLSX from "xlsx";

const projectRoot = process.cwd();
const outputDir = path.join(projectRoot, "artifacts", "test-data");
const outputPath = path.join(outputDir, "large-random-test-4sheet-15col.xlsx");
const targetSizeBytes = 40 * 1024 * 1024;
const rowCount = 8000;
const columnCount = 15;

const buildCellValue = (rowIndex, columnIndex) => {
  const seed = `${rowIndex}-${columnIndex}-${Date.now()}-${Math.random()}`;
  const digest = crypto.createHash("sha256").update(seed).digest("hex");
  return `R${rowIndex + 1}C${columnIndex + 1}_${digest}_${seed}`;
};

const buildSheetData = (sheetName) => {
  const rows = [];
  rows.push(
    Array.from({ length: columnCount }, (_, columnIndex) => `${sheetName}_HEADER_${columnIndex + 1}`),
  );

  for (let rowIndex = 0; rowIndex < rowCount; rowIndex += 1) {
    const row = [];
    for (let columnIndex = 0; columnIndex < columnCount; columnIndex += 1) {
      row.push(buildCellValue(rowIndex, columnIndex));
    }
    rows.push(row);
  }

  return rows;
};

const main = async () => {
  await fs.mkdir(outputDir, { recursive: true });

  const workbook = XLSX.utils.book_new();
  const sheetNames = ["LargeData_A", "LargeData_B", "LargeData_C", "LargeData_D"];

  for (const sheetName of sheetNames) {
    const data = buildSheetData(sheetName);
    const worksheet = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  }

  XLSX.writeFile(workbook, outputPath, { compression: true });

  const stats = await fs.stat(outputPath);
  const sizeMb = (stats.size / 1024 / 1024).toFixed(2);

  process.stdout.write(`Generated: ${outputPath}\n`);
  process.stdout.write(`Size: ${sizeMb} MB\n`);

  if (stats.size < targetSizeBytes) {
    process.stdout.write("Warning: generated file is smaller than 40 MB target.\n");
  }
};

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`);
  process.exit(1);
});
