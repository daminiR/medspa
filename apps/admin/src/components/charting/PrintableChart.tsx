'use client';

/**
 * PrintableChart - Print-friendly view of the treatment chart
 *
 * This component renders a clean, professional print layout for treatment charts
 * that can be printed using the browser's native print functionality (Cmd+P / Ctrl+P).
 *
 * Features:
 * - Clean, professional layout optimized for print
 * - Patient info, date, and provider details
 * - Chart snapshot with all injection points visible
 * - Treatment summary table with products, units, and costs
 * - Space for provider and patient signatures
 * - Works with browser print (no external dependencies required)
 * - Canvas capture for 2D charts and SVG rendering
 * - Keyboard shortcut support (Cmd/Ctrl + P)
 */

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { X, Printer, Download, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface TreatmentSummaryItem {
  productId: string;
  productName: string;
  area: string;
  units?: number;
  volume?: number;
  pricePerUnit: number;
  type: 'toxin' | 'filler';
}

export interface PrintableChartProps {
  // Patient Information
  patientName: string;
  patientMrn?: string;
  patientDob?: string;

  // Visit Information
  date: Date;
  provider: string;
  clinicName?: string;
  clinicLogo?: string;
  clinicAddress?: string;
  clinicPhone?: string;

  // Chart Data
  chartImageRef?: React.RefObject<HTMLElement | null>;
  chartImageUrl?: string;

  // Treatment Summary
  treatmentItems: TreatmentSummaryItem[];

  // Notes
  notes?: string;
  soapNotes?: {
    subjective?: string;
    objective?: string;
    assessment?: string;
    plan?: string;
  };

  // Control
  isOpen: boolean;
  onClose: () => void;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Captures an HTML element as a canvas image
 * Supports SVG elements, existing canvas, and DOM elements
 */
async function captureElementAsImage(element: HTMLElement, scale: number = 2): Promise<string | null> {
  try {
    // Check for existing canvas element
    const existingCanvas = element.querySelector('canvas') as HTMLCanvasElement | null;
    if (existingCanvas) {
      return existingCanvas.toDataURL('image/png');
    }

    // Check for SVG element
    const svgElement = element.querySelector('svg');
    if (svgElement) {
      return await captureSvgAsImage(svgElement, scale);
    }

    // Fallback: Create a simple canvas snapshot
    const rect = element.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = rect.width * scale;
    canvas.height = rect.height * scale;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;

    ctx.scale(scale, scale);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, rect.width, rect.height);

    // Try to render with html2canvas-like approach
    // For now, draw a simple placeholder
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(10, 10, rect.width - 20, rect.height - 20);
    ctx.strokeStyle = '#e5e7eb';
    ctx.strokeRect(10, 10, rect.width - 20, rect.height - 20);

    // Draw "Chart Preview" text
    ctx.fillStyle = '#6b7280';
    ctx.font = '16px system-ui, -apple-system, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Chart Preview', rect.width / 2, rect.height / 2);

    return canvas.toDataURL('image/png');
  } catch (error) {
    console.error('Failed to capture element:', error);
    return null;
  }
}

/**
 * Captures an SVG element as a PNG image
 */
async function captureSvgAsImage(svgElement: SVGSVGElement, scale: number = 2): Promise<string> {
  return new Promise((resolve, reject) => {
    try {
      // Clone the SVG to avoid modifying the original
      const clonedSvg = svgElement.cloneNode(true) as SVGSVGElement;

      // Ensure the SVG has proper dimensions
      const rect = svgElement.getBoundingClientRect();
      if (!clonedSvg.getAttribute('width')) {
        clonedSvg.setAttribute('width', String(rect.width));
      }
      if (!clonedSvg.getAttribute('height')) {
        clonedSvg.setAttribute('height', String(rect.height));
      }

      // Add xmlns if missing
      if (!clonedSvg.getAttribute('xmlns')) {
        clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      }

      // Serialize the SVG
      const svgData = new XMLSerializer().serializeToString(clonedSvg);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // Create an image from the SVG
      const img = new Image();
      img.onload = () => {
        // Create a canvas to draw the image
        const canvas = document.createElement('canvas');
        const width = rect.width || img.width;
        const height = rect.height || img.height;
        canvas.width = width * scale;
        canvas.height = height * scale;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(svgUrl);
          reject(new Error('Could not get canvas context'));
          return;
        }

        // Draw with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.scale(scale, scale);
        ctx.drawImage(img, 0, 0, width, height);

        URL.revokeObjectURL(svgUrl);
        resolve(canvas.toDataURL('image/png'));
      };

      img.onerror = () => {
        URL.revokeObjectURL(svgUrl);
        reject(new Error('Failed to load SVG as image'));
      };

      img.src = svgUrl;
    } catch (error) {
      reject(error);
    }
  });
}

// =============================================================================
// KEYBOARD SHORTCUT HOOK
// =============================================================================

/**
 * Hook to handle Cmd/Ctrl + P for print
 */
function usePrintShortcut(
  isOpen: boolean,
  onPrint: () => void,
  onOpenPrintModal?: () => void
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();

        if (isOpen) {
          // If print modal is already open, trigger print
          onPrint();
        } else if (onOpenPrintModal) {
          // Open the print modal first
          onOpenPrintModal();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onPrint, onOpenPrintModal]);
}

// =============================================================================
// PRINT STYLES (Embedded CSS for the print window)
// =============================================================================

const PRINT_STYLES = `
  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    line-height: 1.5;
    color: #111827;
    background: white;
    padding: 0;
    margin: 0;
    font-size: 12pt;
  }
  .print-container {
    max-width: 8.5in;
    margin: 0 auto;
    padding: 0.5in;
  }

  /* Header Section */
  .header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    padding-bottom: 1rem;
    border-bottom: 3px solid #7c3aed;
    margin-bottom: 1.5rem;
  }
  .clinic-info h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: #7c3aed;
    margin-bottom: 0.25rem;
  }
  .clinic-info p {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0.125rem 0;
  }
  .clinic-logo {
    max-height: 60px;
    width: auto;
    margin-bottom: 0.5rem;
  }
  .patient-info {
    text-align: right;
  }
  .patient-info h2 {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    color: #111827;
  }
  .patient-info p {
    font-size: 0.75rem;
    color: #6b7280;
    margin: 0.125rem 0;
  }

  /* Visit Details Grid */
  .visit-details {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    padding: 1rem;
    background: #f9fafb;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
    border: 1px solid #e5e7eb;
  }
  .visit-details div {
    text-align: center;
  }
  .visit-details label {
    display: block;
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    margin-bottom: 0.25rem;
    font-weight: 600;
  }
  .visit-details span {
    font-weight: 600;
    color: #111827;
    font-size: 0.875rem;
  }

  /* Section Headers */
  .section-header {
    font-size: 0.75rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #6b7280;
    margin-bottom: 0.75rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid #e5e7eb;
  }

  /* Chart Image Section */
  .chart-section {
    margin-bottom: 1.5rem;
  }
  .chart-image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 1rem;
    background: #fafafa;
    border: 1px solid #e5e7eb;
    border-radius: 0.5rem;
    min-height: 280px;
    max-height: 400px;
  }
  .chart-image-container img {
    max-width: 100%;
    max-height: 380px;
    object-fit: contain;
  }
  .chart-placeholder {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 280px;
    background: #f3f4f6;
    border-radius: 0.5rem;
    color: #9ca3af;
    font-size: 0.875rem;
    text-align: center;
    gap: 0.5rem;
  }

  /* Treatment Summary Table */
  .summary-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 1.5rem;
    font-size: 0.8125rem;
  }
  .summary-table th {
    text-align: left;
    padding: 0.625rem 0.75rem;
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #6b7280;
    font-weight: 700;
  }
  .summary-table td {
    padding: 0.5rem 0.75rem;
    border-bottom: 1px solid #e5e7eb;
    vertical-align: middle;
  }
  .summary-table tr:last-child td {
    border-bottom: none;
  }
  .summary-table tr:nth-child(even) {
    background: #fafafa;
  }
  .summary-table .total-row {
    background: #f3f4f6 !important;
    font-weight: 700;
  }
  .summary-table .total-row td {
    border-top: 2px solid #d1d5db;
    border-bottom: none;
    padding-top: 0.75rem;
    padding-bottom: 0.75rem;
  }
  .summary-table .total-amount {
    color: #7c3aed;
    font-size: 1rem;
  }
  .text-right {
    text-align: right;
  }
  .text-center {
    text-align: center;
  }

  /* Product Color Indicators */
  .product-indicator {
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 0.5rem;
    vertical-align: middle;
  }
  .product-toxin { background-color: #8b5cf6; }
  .product-filler { background-color: #ec4899; }

  /* Notes Section */
  .notes-section {
    padding: 1rem;
    background: #fffbeb;
    border: 1px solid #fde68a;
    border-radius: 0.5rem;
    margin-bottom: 1.5rem;
  }
  .notes-section h3 {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #92400e;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }
  .notes-section p {
    font-size: 0.8125rem;
    color: #78350f;
    white-space: pre-wrap;
    line-height: 1.6;
  }

  /* SOAP Notes Section */
  .soap-section {
    margin-bottom: 1.5rem;
    page-break-inside: avoid;
  }
  .soap-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }
  .soap-item {
    padding: 0.75rem;
    background: #f9fafb;
    border-radius: 0.375rem;
    border: 1px solid #e5e7eb;
  }
  .soap-item h4 {
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #7c3aed;
    margin-bottom: 0.375rem;
    font-weight: 700;
  }
  .soap-item p {
    font-size: 0.75rem;
    color: #374151;
    line-height: 1.5;
    white-space: pre-wrap;
  }

  /* Signatures Section */
  .signatures {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 3rem;
    margin-top: 2rem;
    padding-top: 1.5rem;
    border-top: 1px solid #e5e7eb;
    page-break-inside: avoid;
  }
  .signature-block {
    page-break-inside: avoid;
  }
  .signature-block label {
    display: block;
    font-size: 0.625rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #6b7280;
    margin-bottom: 0.5rem;
    font-weight: 600;
  }
  .signature-line {
    border-bottom: 1px solid #111827;
    height: 2.5rem;
    margin-bottom: 0.375rem;
  }
  .signature-date {
    font-size: 0.6875rem;
    color: #6b7280;
  }

  /* Footer */
  .footer {
    margin-top: 2rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
    text-align: center;
    font-size: 0.625rem;
    color: #9ca3af;
  }
  .footer p {
    margin: 0.125rem 0;
  }

  /* Print-specific styles */
  @media print {
    body {
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    .print-container {
      padding: 0;
    }
    @page {
      size: letter portrait;
      margin: 0.5in;
    }
    .chart-section,
    .signatures,
    .soap-section {
      page-break-inside: avoid;
    }
    .summary-table {
      page-break-inside: auto;
    }
    .summary-table tr {
      page-break-inside: avoid;
    }
  }
`;

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function PrintableChart({
  patientName,
  patientMrn,
  patientDob,
  date,
  provider,
  clinicName = 'Medical Spa Clinic',
  clinicLogo,
  clinicAddress,
  clinicPhone,
  chartImageRef,
  chartImageUrl,
  treatmentItems,
  notes,
  soapNotes,
  isOpen,
  onClose,
}: PrintableChartProps) {
  const printRef = useRef<HTMLDivElement>(null);
  const [capturedImageUrl, setCapturedImageUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [captureError, setCaptureError] = useState<string | null>(null);

  // Capture the chart element as an image
  const captureChart = useCallback(async () => {
    if (!chartImageRef?.current) {
      return null;
    }

    setIsCapturing(true);
    setCaptureError(null);

    try {
      const imageUrl = await captureElementAsImage(chartImageRef.current, 2);
      return imageUrl;
    } catch (error) {
      console.error('Failed to capture chart:', error);
      setCaptureError('Failed to capture chart image');
      return null;
    } finally {
      setIsCapturing(false);
    }
  }, [chartImageRef]);

  // Retry capture
  const handleRetryCapture = useCallback(async () => {
    const url = await captureChart();
    if (url) {
      setCapturedImageUrl(url);
    }
  }, [captureChart]);

  // Capture chart when modal opens
  useEffect(() => {
    if (isOpen && chartImageRef?.current && !chartImageUrl) {
      captureChart().then((url) => {
        if (url) {
          setCapturedImageUrl(url);
        }
      });
    }
  }, [isOpen, captureChart, chartImageRef, chartImageUrl]);

  // Handle print action
  const handlePrint = useCallback(() => {
    const printWindow = window.open('', '_blank');
    if (!printWindow || !printRef.current) return;

    const content = printRef.current.innerHTML;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Treatment Chart - ${patientName}</title>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>${PRINT_STYLES}</style>
        </head>
        <body>
          ${content}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    // Wait for images to load before printing
    const images = printWindow.document.images;
    const imageLoadPromises = Array.from(images).map((img) => {
      if (img.complete) return Promise.resolve();
      return new Promise((resolve) => {
        img.onload = resolve;
        img.onerror = resolve;
      });
    });

    Promise.all(imageLoadPromises).then(() => {
      setTimeout(() => {
        printWindow.print();
        // Don't close immediately - let user interact with print dialog
      }, 100);
    });
  }, [patientName]);

  // Handle export as PDF (using print to PDF)
  const handleExport = useCallback(() => {
    handlePrint();
  }, [handlePrint]);

  // Register keyboard shortcut
  usePrintShortcut(isOpen, handlePrint);

  // Calculate totals
  const totals = React.useMemo(() => {
    const toxinTotal = treatmentItems
      .filter((item) => item.type === 'toxin')
      .reduce((sum, item) => sum + (item.units || 0), 0);

    const fillerTotal = treatmentItems
      .filter((item) => item.type === 'filler')
      .reduce((sum, item) => sum + (item.volume || 0), 0);

    const costTotal = treatmentItems.reduce((sum, item) => {
      const quantity = item.type === 'toxin' ? (item.units || 0) : (item.volume || 0);
      return sum + quantity * item.pricePerUnit;
    }, 0);

    return { toxinTotal, fillerTotal, costTotal };
  }, [treatmentItems]);

  // Group treatment items by product
  const groupedItems = React.useMemo(() => {
    const groups = new Map<string, TreatmentSummaryItem[]>();
    treatmentItems.forEach((item) => {
      const key = item.productName;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    });
    return groups;
  }, [treatmentItems]);

  if (!isOpen) return null;

  const imageUrl = chartImageUrl || capturedImageUrl;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
        onClick={onClose}
      />

      {/* Modal Content */}
      <div className="fixed inset-4 md:inset-8 lg:inset-12 bg-white rounded-2xl shadow-2xl z-50 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Printer className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Print Preview</h2>
              <p className="text-sm text-gray-500">Treatment chart for {patientName}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-gray-400 mr-2">
              Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-600 font-mono">Cmd+P</kbd> to print
            </span>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={onClose}
              className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Print Preview */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4 md:p-8">
          <div
            ref={printRef}
            className="bg-white max-w-[8.5in] mx-auto shadow-lg rounded-lg overflow-hidden"
            style={{ minHeight: '11in' }}
          >
            <div className="print-container p-6 md:p-8">
              {/* Header */}
              <div className="flex justify-between items-start pb-4 border-b-[3px] border-purple-600 mb-6">
                <div className="clinic-info">
                  {clinicLogo ? (
                    <img src={clinicLogo} alt={clinicName} className="h-12 mb-2 clinic-logo" />
                  ) : (
                    <h1 className="text-2xl font-bold text-purple-600 mb-1">{clinicName}</h1>
                  )}
                  <p className="text-xs text-gray-500">Treatment Documentation</p>
                  {clinicAddress && <p className="text-xs text-gray-400">{clinicAddress}</p>}
                  {clinicPhone && <p className="text-xs text-gray-400">{clinicPhone}</p>}
                </div>
                <div className="patient-info text-right">
                  <h2 className="text-lg font-semibold text-gray-900">{patientName}</h2>
                  {patientMrn && <p className="text-xs text-gray-500">MRN: {patientMrn}</p>}
                  {patientDob && <p className="text-xs text-gray-500">DOB: {patientDob}</p>}
                </div>
              </div>

              {/* Visit Details */}
              <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg mb-6 border border-gray-100">
                <div className="text-center">
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">Date</label>
                  <span className="font-semibold text-sm">{formatDate(date)}</span>
                </div>
                <div className="text-center">
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">Provider</label>
                  <span className="font-semibold text-sm">{provider}</span>
                </div>
                <div className="text-center">
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-1 font-semibold">Time</label>
                  <span className="font-semibold text-sm">{date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}</span>
                </div>
              </div>

              {/* Chart Image */}
              <div className="chart-section mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200 section-header">
                  Treatment Map
                </h3>
                <div className="flex justify-center p-4 bg-gray-50 border border-gray-200 rounded-lg min-h-[280px] max-h-[400px] chart-image-container">
                  {isCapturing ? (
                    <div className="flex flex-col items-center justify-center w-full h-[280px] gap-3">
                      <Loader2 className="w-8 h-8 text-purple-600 animate-spin" />
                      <span className="text-sm text-gray-500">Capturing chart...</span>
                    </div>
                  ) : captureError ? (
                    <div className="flex flex-col items-center justify-center w-full h-[280px] gap-3 text-center">
                      <AlertCircle className="w-8 h-8 text-amber-500" />
                      <span className="text-sm text-gray-500">{captureError}</span>
                      <button
                        onClick={handleRetryCapture}
                        className="flex items-center gap-2 px-3 py-1.5 text-sm text-purple-600 hover:text-purple-700 hover:bg-purple-50 rounded-lg transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                      </button>
                    </div>
                  ) : imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Treatment chart showing injection points"
                      className="max-w-full max-h-[380px] object-contain"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center w-full h-[280px] bg-gray-100 rounded-lg text-gray-400 chart-placeholder">
                      <AlertCircle className="w-8 h-8 mb-2" />
                      <span>Chart preview not available</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Treatment Summary Table */}
              <div className="chart-section mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200 section-header">
                  Treatment Summary
                </h3>
                <table className="w-full border-collapse summary-table">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="text-left p-2.5 text-[10px] uppercase tracking-wider text-gray-500 border-b-2 border-gray-200 font-bold">Product</th>
                      <th className="text-left p-2.5 text-[10px] uppercase tracking-wider text-gray-500 border-b-2 border-gray-200 font-bold">Area</th>
                      <th className="text-right p-2.5 text-[10px] uppercase tracking-wider text-gray-500 border-b-2 border-gray-200 font-bold">Qty</th>
                      <th className="text-right p-2.5 text-[10px] uppercase tracking-wider text-gray-500 border-b-2 border-gray-200 font-bold">Unit Price</th>
                      <th className="text-right p-2.5 text-[10px] uppercase tracking-wider text-gray-500 border-b-2 border-gray-200 font-bold">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {treatmentItems.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-4 text-center text-gray-400 italic">
                          No treatments recorded
                        </td>
                      </tr>
                    ) : (
                      treatmentItems.map((item, index) => {
                        const quantity = item.type === 'toxin' ? item.units || 0 : item.volume || 0;
                        const unitLabel = item.type === 'toxin' ? 'u' : 'ml';
                        const subtotal = quantity * item.pricePerUnit;
                        return (
                          <tr key={`${item.productId}-${item.area}-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="p-2.5 text-sm font-medium">
                              <span className={`inline-block w-2 h-2 rounded-full mr-2 ${item.type === 'toxin' ? 'bg-purple-500' : 'bg-pink-500'} product-indicator`}></span>
                              {item.productName}
                            </td>
                            <td className="p-2.5 text-sm text-gray-600">{item.area}</td>
                            <td className="p-2.5 text-sm text-right">{quantity}{unitLabel}</td>
                            <td className="p-2.5 text-sm text-right text-gray-500">{formatCurrency(item.pricePerUnit)}/{unitLabel}</td>
                            <td className="p-2.5 text-sm text-right font-medium">{formatCurrency(subtotal)}</td>
                          </tr>
                        );
                      })
                    )}
                    {treatmentItems.length > 0 && (
                      <tr className="bg-gray-100 font-bold total-row">
                        <td colSpan={2} className="p-3 text-sm border-t-2 border-gray-300">Total</td>
                        <td className="p-3 text-sm text-right border-t-2 border-gray-300">
                          {totals.toxinTotal > 0 && <span>{totals.toxinTotal}u</span>}
                          {totals.toxinTotal > 0 && totals.fillerTotal > 0 && <span> / </span>}
                          {totals.fillerTotal > 0 && <span>{totals.fillerTotal}ml</span>}
                        </td>
                        <td className="p-3 border-t-2 border-gray-300"></td>
                        <td className="p-3 text-right border-t-2 border-gray-300 text-purple-600 text-base total-amount">
                          {formatCurrency(totals.costTotal)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* SOAP Notes Section */}
              {soapNotes && (soapNotes.subjective || soapNotes.objective || soapNotes.assessment || soapNotes.plan) && (
                <div className="mb-6 soap-section">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3 pb-2 border-b border-gray-200 section-header">
                    Clinical Notes (SOAP)
                  </h3>
                  <div className="grid grid-cols-2 gap-3 soap-grid">
                    {soapNotes.subjective && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 soap-item">
                        <h4 className="text-[10px] uppercase tracking-wider text-purple-600 mb-1 font-bold">Subjective</h4>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{soapNotes.subjective}</p>
                      </div>
                    )}
                    {soapNotes.objective && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 soap-item">
                        <h4 className="text-[10px] uppercase tracking-wider text-purple-600 mb-1 font-bold">Objective</h4>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{soapNotes.objective}</p>
                      </div>
                    )}
                    {soapNotes.assessment && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 soap-item">
                        <h4 className="text-[10px] uppercase tracking-wider text-purple-600 mb-1 font-bold">Assessment</h4>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{soapNotes.assessment}</p>
                      </div>
                    )}
                    {soapNotes.plan && (
                      <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 soap-item">
                        <h4 className="text-[10px] uppercase tracking-wider text-purple-600 mb-1 font-bold">Plan</h4>
                        <p className="text-xs text-gray-700 whitespace-pre-wrap">{soapNotes.plan}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Additional Notes Section */}
              {notes && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg mb-6 notes-section">
                  <h3 className="text-[10px] uppercase tracking-wider text-amber-800 mb-2 font-bold">Additional Notes</h3>
                  <p className="text-sm text-amber-900 whitespace-pre-wrap">{notes}</p>
                </div>
              )}

              {/* Signatures */}
              <div className="grid grid-cols-2 gap-12 mt-8 pt-6 border-t border-gray-200 signatures">
                <div className="signature-block">
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-semibold">Provider Signature</label>
                  <div className="border-b border-gray-900 h-10 mb-1 signature-line" />
                  <p className="text-xs text-gray-500 signature-date">Date: _________________</p>
                </div>
                <div className="signature-block">
                  <label className="block text-[10px] uppercase tracking-wider text-gray-500 mb-2 font-semibold">Patient Signature</label>
                  <div className="border-b border-gray-900 h-10 mb-1 signature-line" />
                  <p className="text-xs text-gray-500 signature-date">Date: _________________</p>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-8 pt-4 border-t border-gray-200 text-center footer">
                <p className="text-[10px] text-gray-400">
                  Generated on {new Date().toLocaleString()} | {clinicName}
                </p>
                <p className="text-[10px] text-gray-400 mt-0.5">
                  This document contains protected health information (PHI) and should be handled in accordance with HIPAA regulations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// =============================================================================
// UTILITY HOOK FOR EXTERNAL KEYBOARD SHORTCUT
// =============================================================================

/**
 * Hook to add Cmd/Ctrl + P handler from the charting page
 * This allows the parent component to open the print modal when the shortcut is pressed
 */
export function useChartPrintShortcut(onOpenPrintModal: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
        e.preventDefault();
        onOpenPrintModal();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenPrintModal]);
}

export default PrintableChart;
