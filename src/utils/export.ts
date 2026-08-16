// xlsx is an optional peer, so the consuming app picks the version. The npm
// release is frozen at 0.18.5 and carries CVE-2023-30533 with no patch;
// maintained builds live at cdn.sheetjs.com. Parse only files a user chose.
import * as XLSX from "xlsx";

export interface ExportColumn<T> {
  header: string;
  accessor: (row: T) => string | number | null | undefined;
}

export interface ExportMeta {
  title: string;
  recordCount?: number;
  filters?: string;
  generatedAt?: string;
}

function pad(value: number): string {
  return String(value).padStart(2, "0");
}

function formatTimestamp(date: Date): string {
  return date.toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export function formatFilenameTimestamp(date: Date): string {
  const datePart = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
  return `${datePart}_${pad(date.getHours())}${pad(date.getMinutes())}`;
}

function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeCsv(val: string): string {
  if (val.includes(",") || val.includes('"') || val.includes("\n")) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

export function exportToCsv<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
) {
  const headerRow = columns.map((c) => escapeCsv(c.header)).join(",");
  const dataRows = data.map((row) =>
    columns
      .map((c) => {
        const val = c.accessor(row);
        return escapeCsv(val == null ? "" : String(val));
      })
      .join(","),
  );
  const csv = [headerRow, ...dataRows].join("\r\n");
  const blob = new Blob(["﻿" + csv], {
    type: "text/csv;charset=utf-8;bom",
  });
  downloadBlob(filename.endsWith(".csv") ? filename : `${filename}.csv`, blob);
}

export function exportToXlsx<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
) {
  const headerRow = columns.map((c) => c.header);
  const dataRows = data.map((row) =>
    columns.map((c) => {
      const val = c.accessor(row);
      return val == null ? "" : String(val);
    }),
  );
  const ws = XLSX.utils.aoa_to_sheet([headerRow, ...dataRows]);

  const colWidths = columns.map((c) => ({
    wch: Math.max(c.header.length, 12),
  }));
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");
  XLSX.writeFile(
    wb,
    filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`,
  );
}

function buildReportHtml<T>(
  data: T[],
  columns: ExportColumn<T>[],
  meta: ExportMeta,
) {
  const now = meta.generatedAt ?? formatTimestamp(new Date());
  const metadataLines: string[] = [];
  if (meta.recordCount != null) {
    metadataLines.push(`Records: ${String(meta.recordCount)}`);
  }
  if (meta.filters) {
    metadataLines.push(`Filters: "${meta.filters}"`);
  }
  metadataLines.push(`Generated: ${now}`);

  const headerCells = columns
    .map((c) => `            <th>${c.header}</th>`)
    .join("\n");

  const bodyRows = data
    .map(
      (row) => `          <tr>
${columns
  .map((c) => {
    const val = c.accessor(row);
    return `            <td>${val == null ? "—" : String(val)}</td>`;
  })
  .join("\n")}
          </tr>`,
    )
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${meta.title} — Export</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Inter', 'Segoe UI', system-ui, -apple-system, sans-serif; color: #1f2937; background: #fff; }
    .header { display: flex; align-items: center; padding: 20px 32px; border-bottom: 2px solid #e5e7eb; background: #f9fafb; gap: 24px; }
    .header-left { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
    .title-row { padding: 20px 32px 4px; }
    .title-row h2 { font-size: 20px; font-weight: 600; color: #111827; }
    .header-right { text-align: right; flex: 1; }
    .header-right .meta { font-size: 12px; color: #6b7280; line-height: 1.7; white-space: nowrap; }
    .header-right .meta strong { color: #374151; font-weight: 600; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0 32px; }
    th { background: #f3f4f6; text-align: left; padding: 10px 16px; font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.06em; color: #6b7280; border-bottom: 2px solid #e5e7eb; }
    td { padding: 10px 16px; border-bottom: 1px solid #e5e7eb; font-size: 13px; color: #374151; }
    tr:last-child td { border-bottom: none; }
    .footer { text-align: center; padding: 16px 32px; font-size: 11px; color: #9ca3af; border-top: 1px solid #e5e7eb; }
    @media print { .header { background: #f9fafb; -webkit-print-color-adjust: exact; print-color-adjust: exact; } th { background: #f3f4f6 !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="header-right">
      <div class="meta"><strong>${meta.title}</strong></div>
      ${metadataLines.map((line) => `<div class="meta">${line}</div>`).join("\n      ")}
    </div>
  </div>

  <div class="title-row">
    <h2>${meta.title}</h2>
  </div>

  <table>
    <thead>
      <tr>
${headerCells}
      </tr>
    </thead>
    <tbody>
${bodyRows}
    </tbody>
  </table>

  <div class="footer">
    Generated ${now}
  </div>
</body>
</html>`;
}

export function exportToPdf<T>(
  data: T[],
  columns: ExportColumn<T>[],
  filename: string,
  meta: ExportMeta,
) {
  const html = buildReportHtml(data, columns, meta);
  const printFilename = filename.endsWith(".pdf") ? filename : `${filename}.pdf`;

  const printWindow = window.open("", "_blank");
  if (!printWindow) {
    return;
  }

  printWindow.document.write(html);
  printWindow.document.title = printFilename;
  printWindow.document.close();

  printWindow.onload = () => {
    printWindow.focus();

    const mediaQuery = printWindow.matchMedia("print");
    mediaQuery.addEventListener("change", (mql) => {
      if (!mql.matches) {
        printWindow.close();
      }
    });

    printWindow.print();
  };
}
