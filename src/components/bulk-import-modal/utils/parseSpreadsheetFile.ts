// Optional peer, pinned by the consuming app. See the note in utils/export.ts:
// the npm release is frozen at 0.18.5 with CVE-2023-30533 unpatched.
import * as XLSX from "xlsx";
import type { ParsedSpreadsheet } from "../../../types/bulk-import-modal";
import { ACCEPTED_EXTENSIONS } from "../constants";

export class BulkImportParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BulkImportParseError";
  }
}

function getExtension(fileName: string) {
  const dotIndex = fileName.lastIndexOf(".");
  return dotIndex === -1 ? "" : fileName.slice(dotIndex).toLowerCase();
}

function isCsvFile(fileName: string) {
  return getExtension(fileName) === ".csv";
}

function normalizeCellValue(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value).trim();
}

export function normalizeRows(rows: unknown[][]): string[][] {
  return rows.map((row) =>
    row.map((cell) => normalizeCellValue(cell)),
  );
}

export function filterEmptyRows(rows: string[][]): string[][] {
  return rows.filter((row) =>
    row.some((cell) => cell.length > 0),
  );
}

export function isAcceptedSpreadsheetFile(fileName: string) {
  return ACCEPTED_EXTENSIONS.includes(getExtension(fileName) as typeof ACCEPTED_EXTENSIONS[number]);
}

export function isCsv(fileName: string) {
  return isCsvFile(fileName);
}

export function parseCsvText(text: string): string[][] {
  const rows: string[][] = [];
  let current = "";
  let inQuotes = false;
  let row: string[] = [];

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];

    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(current);
        current = "";
      } else if (ch === "\n") {
        row.push(current);
        current = "";
        if (row.some((c) => c.length > 0)) {
          rows.push(row);
        }
        row = [];
      } else if (ch === "\r") {
        // skip
      } else {
        current += ch;
      }
    }
  }

  row.push(current);
  if (row.some((c) => c.length > 0)) {
    rows.push(row);
  }

  return rows;
}

export async function parseSpreadsheetFile(
  file: File,
  maxFileSizeBytes = 5 * 1024 * 1024,
): Promise<ParsedSpreadsheet> {
  if (!isAcceptedSpreadsheetFile(file.name)) {
    throw new BulkImportParseError(
      "Unsupported file type. Upload a .xlsx, .xls, or .csv file.",
    );
  }

  if (file.size > maxFileSizeBytes) {
    throw new BulkImportParseError(
      `File is too large. Maximum size is ${Math.round(maxFileSizeBytes / (1024 * 1024))} MB.`,
    );
  }

  if (isCsvFile(file.name)) {
    const text = await file.text();
    const rows = parseCsvText(text);

    if (rows.length === 0) {
      throw new BulkImportParseError("The uploaded file is empty.");
    }

    return {
      rows,
      fileName: file.name,
    };
  }

  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new BulkImportParseError("The uploaded file has no worksheets.");
  }

  const worksheet = workbook.Sheets[firstSheetName];
  const rawRows = XLSX.utils.sheet_to_json<unknown[]>(worksheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  const rows = normalizeRows(rawRows).filter((row) =>
    row.some((cell) => cell.length > 0),
  );

  if (rows.length === 0) {
    throw new BulkImportParseError("The uploaded file is empty.");
  }

  return {
    rows,
    fileName: file.name,
  };
}
