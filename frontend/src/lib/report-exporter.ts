/**
 * report-exporter.ts
 * Pure frontend PDF and Excel export utilities — no backend required.
 * Uses jspdf + jspdf-autotable for PDF and SheetJS (xlsx) for Excel/CSV.
 */

import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ReportColumn {
  header: string
  key: string
  width?: number // Excel column width (chars)
}

export interface ReportMeta {
  title: string
  subtitle?: string
  dateRange?: { start: string; end: string }
  generatedAt?: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(date: Date = new Date()) {
  return date.toLocaleDateString('en-KE', { day: '2-digit', month: 'short', year: 'numeric' })
}

function formatDateTime(date: Date = new Date()) {
  return date.toLocaleString('en-KE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

function sanitizeFilename(name: string) {
  return name.replace(/[^a-z0-9_\-]/gi, '_').toLowerCase()
}

// ─── Excel Export ─────────────────────────────────────────────────────────────

export function exportToExcel(
  data: Record<string, any>[],
  columns: ReportColumn[],
  meta: ReportMeta,
  filename?: string
) {
  const wb = XLSX.utils.book_new()

  // ── Title rows ──
  const titleRows = [
    [meta.title],
    meta.subtitle ? [meta.subtitle] : [],
    meta.dateRange ? [`Period: ${meta.dateRange.start} → ${meta.dateRange.end}`] : [],
    [`Generated: ${formatDateTime()}`],
    [], // blank row
    columns.map(c => c.header), // header row
  ].filter(r => r.length > 0)

  // ── Data rows ──
  const dataRows = data.map(row =>
    columns.map(col => {
      const val = row[col.key]
      return val !== undefined && val !== null ? val : ''
    })
  )

  const wsData = [...titleRows, ...dataRows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Column widths
  ws['!cols'] = columns.map(c => ({ wch: c.width || 18 }))

  // Merge title cell across all columns
  ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: columns.length - 1 } }]

  XLSX.utils.book_append_sheet(wb, ws, meta.title.slice(0, 31))

  const fname = filename || `${sanitizeFilename(meta.title)}_${new Date().toISOString().slice(0, 10)}.xlsx`
  XLSX.writeFile(wb, fname)
}

// ─── CSV Export ───────────────────────────────────────────────────────────────

export function exportToCSV(
  data: Record<string, any>[],
  columns: ReportColumn[],
  meta: ReportMeta,
  filename?: string
) {
  const wb = XLSX.utils.book_new()
  const wsData = [
    columns.map(c => c.header),
    ...data.map(row => columns.map(col => row[col.key] ?? '')),
  ]
  const ws = XLSX.utils.aoa_to_sheet(wsData)
  XLSX.utils.book_append_sheet(wb, ws, 'Report')

  const fname = filename || `${sanitizeFilename(meta.title)}_${new Date().toISOString().slice(0, 10)}.csv`
  XLSX.writeFile(wb, fname, { bookType: 'csv' })
}

// ─── PDF Export ───────────────────────────────────────────────────────────────

export function exportToPDF(
  data: Record<string, any>[],
  columns: ReportColumn[],
  meta: ReportMeta,
  filename?: string
) {
  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' })

  const pageWidth = doc.internal.pageSize.getWidth()
  const primaryColor: [number, number, number] = [59, 130, 246] // blue-500

  // ── Header banner ──
  doc.setFillColor(...primaryColor)
  doc.rect(0, 0, pageWidth, 28, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.setFont('helvetica', 'bold')
  doc.text(meta.title, 14, 12)

  if (meta.subtitle) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'normal')
    doc.text(meta.subtitle, 14, 20)
  }

  // Generated at (top right)
  doc.setFontSize(8)
  doc.text(`Generated: ${formatDateTime()}`, pageWidth - 14, 10, { align: 'right' })

  if (meta.dateRange) {
    doc.text(`Period: ${meta.dateRange.start} → ${meta.dateRange.end}`, pageWidth - 14, 17, { align: 'right' })
  }

  // ── Summary row (totals) ──
  const totalRows = data.length
  doc.setTextColor(80, 80, 80)
  doc.setFontSize(9)
  doc.setFont('helvetica', 'normal')
  doc.text(`Total Records: ${totalRows}`, 14, 35)

  // ── Table ──
  autoTable(doc, {
    startY: 40,
    head: [columns.map(c => c.header)],
    body: data.map(row => columns.map(col => {
      const val = row[col.key]
      return val !== undefined && val !== null ? String(val) : '—'
    })),
    headStyles: {
      fillColor: primaryColor,
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 9,
    },
    bodyStyles: { fontSize: 8.5, textColor: [40, 40, 40] },
    alternateRowStyles: { fillColor: [245, 247, 250] },
    styles: { cellPadding: 3, lineColor: [220, 225, 235], lineWidth: 0.1 },
    margin: { left: 14, right: 14 },
    didDrawPage: (hookData) => {
      // Footer on each page
      const pageCount = (doc as any).internal.getNumberOfPages()
      doc.setFontSize(7)
      doc.setTextColor(150, 150, 150)
      doc.text(
        `InvenTrack · ${meta.title} · Page ${hookData.pageNumber} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.getHeight() - 6,
        { align: 'center' }
      )
    },
  })

  const fname = filename || `${sanitizeFilename(meta.title)}_${new Date().toISOString().slice(0, 10)}.pdf`
  doc.save(fname)
}

// ─── Unified export dispatcher ────────────────────────────────────────────────

export function exportReport(
  format: 'pdf' | 'excel' | 'csv',
  data: Record<string, any>[],
  columns: ReportColumn[],
  meta: ReportMeta,
  filename?: string
) {
  if (format === 'pdf') return exportToPDF(data, columns, meta, filename)
  if (format === 'excel') return exportToExcel(data, columns, meta, filename)
  if (format === 'csv') return exportToCSV(data, columns, meta, filename)
}
