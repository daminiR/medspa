/**
 * Export Utility Library
 * Provides CSV and Excel export functionality for reports
 */

// ============================================================================
// TYPES
// ============================================================================

export interface ExportColumn {
  key: string;
  header: string;
  width?: number;
  formatter?: (value: any) => string;
}

export interface ExportOptions {
  filename: string;
  format: 'csv' | 'xlsx';
  columns: ExportColumn[];
  data: Record<string, any>[];
  title?: string;
  dateRange?: { start: string; end: string };
}

export interface ExportResult {
  success: boolean;
  filename: string;
  mimeType: string;
  blob?: Blob;
  error?: string;
}

// ============================================================================
// FORMATTERS
// ============================================================================

export const formatters = {
  currency: (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  },

  percentage: (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return `${value.toFixed(1)}%`;
  },

  number: (value: number | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return value.toLocaleString('en-US');
  },

  date: (value: Date | string | null | undefined): string => {
    if (!value) return '-';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  },

  dateTime: (value: Date | string | null | undefined): string => {
    if (!value) return '-';
    const date = typeof value === 'string' ? new Date(value) : value;
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  boolean: (value: boolean | null | undefined): string => {
    if (value === null || value === undefined) return '-';
    return value ? 'Yes' : 'No';
  },

  text: (value: string | null | undefined): string => {
    return value || '-';
  },
};

// ============================================================================
// CSV GENERATION
// ============================================================================

/**
 * Escape a value for CSV format
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // If the value contains commas, quotes, or newlines, wrap it in quotes
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n') || stringValue.includes('\r')) {
    // Escape any existing quotes by doubling them
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Generate CSV content from data
 */
export function generateCSV(options: ExportOptions): string {
  const { columns, data, title, dateRange } = options;

  const lines: string[] = [];

  // Add title row if provided
  if (title) {
    lines.push(escapeCSVValue(title));
  }

  // Add date range if provided
  if (dateRange) {
    lines.push(`Date Range: ${dateRange.start} to ${dateRange.end}`);
  }

  // Add empty line after header info
  if (title || dateRange) {
    lines.push('');
  }

  // Add header row
  const headers = columns.map(col => escapeCSVValue(col.header));
  lines.push(headers.join(','));

  // Add data rows
  data.forEach(row => {
    const values = columns.map(col => {
      let value = row[col.key];

      // Apply formatter if provided
      if (col.formatter && value !== undefined && value !== null) {
        value = col.formatter(value);
      }

      return escapeCSVValue(value);
    });

    lines.push(values.join(','));
  });

  return lines.join('\r\n');
}

// ============================================================================
// EXCEL GENERATION (Simple XML-based xlsx)
// ============================================================================

/**
 * Generate a simple Excel XML spreadsheet
 * For more complex Excel files, consider using a library like xlsx or exceljs
 */
export function generateExcelXML(options: ExportOptions): string {
  const { columns, data, title, dateRange } = options;

  const escapeXML = (value: any): string => {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  };

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"\n';
  xml += '  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
  xml += '  <Worksheet ss:Name="Report">\n';
  xml += '    <Table>\n';

  let rowIndex = 0;

  // Add title row if provided
  if (title) {
    xml += '      <Row>\n';
    xml += `        <Cell><Data ss:Type="String">${escapeXML(title)}</Data></Cell>\n`;
    xml += '      </Row>\n';
    rowIndex++;
  }

  // Add date range if provided
  if (dateRange) {
    xml += '      <Row>\n';
    xml += `        <Cell><Data ss:Type="String">Date Range: ${dateRange.start} to ${dateRange.end}</Data></Cell>\n`;
    xml += '      </Row>\n';
    xml += '      <Row></Row>\n'; // Empty row
    rowIndex += 2;
  }

  // Add header row
  xml += '      <Row>\n';
  columns.forEach(col => {
    xml += `        <Cell><Data ss:Type="String">${escapeXML(col.header)}</Data></Cell>\n`;
  });
  xml += '      </Row>\n';

  // Add data rows
  data.forEach(row => {
    xml += '      <Row>\n';
    columns.forEach(col => {
      let value = row[col.key];

      // Apply formatter if provided
      if (col.formatter && value !== undefined && value !== null) {
        value = col.formatter(value);
      }

      // Determine data type
      let dataType = 'String';
      if (typeof value === 'number') {
        dataType = 'Number';
      }

      xml += `        <Cell><Data ss:Type="${dataType}">${escapeXML(value)}</Data></Cell>\n`;
    });
    xml += '      </Row>\n';
  });

  xml += '    </Table>\n';
  xml += '  </Worksheet>\n';
  xml += '</Workbook>';

  return xml;
}

// ============================================================================
// DOWNLOAD HELPERS
// ============================================================================

/**
 * Trigger a file download in the browser
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCSV(options: ExportOptions): ExportResult {
  try {
    const csvContent = generateCSV(options);
    const filename = `${options.filename}.csv`;
    const mimeType = 'text/csv;charset=utf-8;';

    downloadFile(csvContent, filename, mimeType);

    return {
      success: true,
      filename,
      mimeType,
      blob: new Blob([csvContent], { type: mimeType }),
    };
  } catch (error) {
    return {
      success: false,
      filename: '',
      mimeType: '',
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}

/**
 * Export data to Excel XML and trigger download
 */
export function exportToExcel(options: ExportOptions): ExportResult {
  try {
    const excelContent = generateExcelXML(options);
    const filename = `${options.filename}.xls`;
    const mimeType = 'application/vnd.ms-excel';

    downloadFile(excelContent, filename, mimeType);

    return {
      success: true,
      filename,
      mimeType,
      blob: new Blob([excelContent], { type: mimeType }),
    };
  } catch (error) {
    return {
      success: false,
      filename: '',
      mimeType: '',
      error: error instanceof Error ? error.message : 'Export failed',
    };
  }
}

/**
 * Export data based on format
 */
export function exportData(options: ExportOptions): ExportResult {
  if (options.format === 'csv') {
    return exportToCSV(options);
  } else {
    return exportToExcel(options);
  }
}

// ============================================================================
// PREDEFINED COLUMN CONFIGURATIONS
// ============================================================================

export const columnPresets = {
  referrals: [
    { key: 'id', header: 'Referral ID' },
    { key: 'referrerName', header: 'Referrer Name' },
    { key: 'refereeName', header: 'Referee Name' },
    { key: 'status', header: 'Status' },
    { key: 'referrerReward', header: 'Referrer Reward', formatter: formatters.currency },
    { key: 'refereeReward', header: 'Referee Reward', formatter: formatters.currency },
    { key: 'createdAt', header: 'Created', formatter: formatters.dateTime },
    { key: 'completedAt', header: 'Completed', formatter: formatters.dateTime },
  ] as ExportColumn[],

  topReferrers: [
    { key: 'patientName', header: 'Patient Name' },
    { key: 'email', header: 'Email' },
    { key: 'referralCode', header: 'Referral Code' },
    { key: 'tier', header: 'Tier' },
    { key: 'totalReferrals', header: 'Total Referrals', formatter: formatters.number },
    { key: 'qualifiedReferrals', header: 'Qualified', formatter: formatters.number },
    { key: 'totalEarnings', header: 'Total Earnings', formatter: formatters.currency },
    { key: 'availableCredits', header: 'Available Credits', formatter: formatters.currency },
  ] as ExportColumn[],

  patientAcquisition: [
    { key: 'source', header: 'Source' },
    { key: 'count', header: 'Patients', formatter: formatters.number },
    { key: 'percentage', header: 'Percentage', formatter: formatters.percentage },
    { key: 'revenue', header: 'First Visit Revenue', formatter: formatters.currency },
    { key: 'averageLTV', header: 'Avg LTV', formatter: formatters.currency },
    { key: 'retentionRate90Day', header: '90-Day Retention', formatter: formatters.percentage },
  ] as ExportColumn[],

  appointments: [
    { key: 'id', header: 'Appointment ID' },
    { key: 'patientName', header: 'Patient' },
    { key: 'serviceName', header: 'Service' },
    { key: 'practitionerName', header: 'Provider' },
    { key: 'startTime', header: 'Date/Time', formatter: formatters.dateTime },
    { key: 'duration', header: 'Duration (min)', formatter: formatters.number },
    { key: 'status', header: 'Status' },
    { key: 'price', header: 'Price', formatter: formatters.currency },
  ] as ExportColumn[],

  revenue: [
    { key: 'date', header: 'Date', formatter: formatters.date },
    { key: 'gross', header: 'Gross Revenue', formatter: formatters.currency },
    { key: 'net', header: 'Net Revenue', formatter: formatters.currency },
    { key: 'appointments', header: 'Appointments', formatter: formatters.number },
    { key: 'services', header: 'Services Revenue', formatter: formatters.currency },
    { key: 'products', header: 'Products Revenue', formatter: formatters.currency },
    { key: 'tips', header: 'Tips', formatter: formatters.currency },
  ] as ExportColumn[],
};

export default {
  generateCSV,
  generateExcelXML,
  downloadFile,
  exportToCSV,
  exportToExcel,
  exportData,
  formatters,
  columnPresets,
};
