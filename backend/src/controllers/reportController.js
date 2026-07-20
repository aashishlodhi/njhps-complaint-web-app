import asyncHandler from 'express-async-handler';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import Complaint from '../models/Complaint.js';

async function buildReportQuery(req) {
  const { status, category, engineer, priority, dateFrom, dateTo } = req.query;
  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (engineer) query.assignedEngineer = engineer;
  if (priority) query.priority = priority;
  if (dateFrom || dateTo) {
    query.date = {};
    if (dateFrom) query.date.$gte = new Date(dateFrom);
    if (dateTo) query.date.$lte = new Date(dateTo);
  }
  return Complaint.find(query)
    .populate('assignedEngineer', 'name')
    .populate('assignedContractor', 'name firmName')
    .sort({ date: -1 });
}

const REPORT_COLUMNS = [
  { header: 'Complaint No.', key: 'complaintNumber', width: 20 },
  { header: 'Date', key: 'date', width: 14 },
  { header: 'Complainant', key: 'complainantName', width: 20 },
  { header: 'Quarter No.', key: 'quarterNumber', width: 14 },
  { header: 'Category', key: 'category', width: 16 },
  { header: 'Priority', key: 'priority', width: 12 },
  { header: 'Status', key: 'status', width: 18 },
  { header: 'Engineer', key: 'engineer', width: 18 },
  { header: 'Contractor', key: 'contractor', width: 18 },
  { header: 'Target Date', key: 'targetDate', width: 14 },
  { header: 'Completion Date', key: 'completionDate', width: 16 },
];

function toRow(c) {
  return {
    complaintNumber: c.complaintNumber,
    date: c.date ? new Date(c.date).toLocaleDateString('en-IN') : '',
    complainantName: c.complainantName,
    quarterNumber: c.quarterNumber,
    category: c.category,
    priority: c.priority,
    status: c.status,
    engineer: c.assignedEngineer?.name || '-',
    contractor: c.assignedContractor?.name || c.assignedContractor?.firmName || '-',
    targetDate: c.targetDate ? new Date(c.targetDate).toLocaleDateString('en-IN') : '-',
    completionDate: c.completionDate ? new Date(c.completionDate).toLocaleDateString('en-IN') : '-',
  };
}

// @desc    Export complaints report as Excel
// @route   GET /api/reports/excel
// @access  Private (admin, operator)
export const exportExcel = asyncHandler(async (req, res) => {
  const complaints = await buildReportQuery(req);

  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Complaints Report');
  sheet.columns = REPORT_COLUMNS;
  sheet.getRow(1).font = { bold: true };
  complaints.forEach((c) => sheet.addRow(toRow(c)));

  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename=njhps-complaints-report.xlsx');
  await workbook.xlsx.write(res);
  res.end();
});

// @desc    Export complaints report as CSV
// @route   GET /api/reports/csv
// @access  Private (admin, operator)
export const exportCsv = asyncHandler(async (req, res) => {
  const complaints = await buildReportQuery(req);
  const header = REPORT_COLUMNS.map((c) => c.header).join(',');
  const rows = complaints.map((c) => {
    const row = toRow(c);
    return REPORT_COLUMNS.map((col) => `"${String(row[col.key] ?? '').replace(/"/g, '""')}"`).join(',');
  });
  const csv = [header, ...rows].join('\n');

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=njhps-complaints-report.csv');
  res.send(csv);
});

// @desc    Export complaints report as PDF
// @route   GET /api/reports/pdf
// @access  Private (admin, operator)
export const exportPdf = asyncHandler(async (req, res) => {
  const complaints = await buildReportQuery(req);

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=njhps-complaints-report.pdf');

  const doc = new PDFDocument({ margin: 30, size: 'A4', layout: 'landscape' });
  doc.pipe(res);

  doc.fontSize(16).text('NJHPS Civil Complaint Cell - Complaints Report', { align: 'center' });
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor('gray').text(`Generated: ${new Date().toLocaleString('en-IN')}`, { align: 'center' });
  doc.moveDown();

  const colWidths = [70, 55, 80, 60, 70, 55, 70, 70, 70, 60, 60];
  const headers = REPORT_COLUMNS.map((c) => c.header);
  let y = doc.y;

  doc.fontSize(8).fillColor('black');
  const drawRow = (values, isHeader = false) => {
    let x = doc.page.margins.left;
    doc.font(isHeader ? 'Helvetica-Bold' : 'Helvetica');
    values.forEach((val, i) => {
      doc.text(String(val), x, y, { width: colWidths[i], ellipsis: true });
      x += colWidths[i];
    });
    y += 16;
    if (y > doc.page.height - doc.page.margins.bottom) {
      doc.addPage({ margin: 30, size: 'A4', layout: 'landscape' });
      y = doc.page.margins.top;
    }
  };

  drawRow(headers, true);
  complaints.forEach((c) => {
    const row = toRow(c);
    drawRow(REPORT_COLUMNS.map((col) => row[col.key]));
  });

  doc.end();
});
