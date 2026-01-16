'use client';

import { Heart, CheckCircle, Printer, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { IIASReceiptData } from '@/lib/payments/mockData';

interface IIASReceiptProps {
  data: IIASReceiptData;
  onClose?: () => void;
}

/**
 * IIAS-Compliant Receipt Component
 *
 * IIAS (Inventory Information Approval System) Requirements:
 * - Service provider name, tax ID, address
 * - Date of service
 * - Description of medical services
 * - Itemized charges
 * - HSA/FSA eligible amount
 * - Provider credentials
 * - IIAS-90 substantiation statement
 */
export default function IIASReceipt({ data, onClose }: IIASReceiptProps) {
  const handlePrint = () => {
    window.print();
  };

  const handleDownload = () => {
    // Create a simple text representation for download
    const receiptText = `
IIAS-COMPLIANT MEDICAL SERVICES RECEIPT
========================================

Receipt #: ${data.receiptNumber}

SERVICE PROVIDER
----------------
${data.provider.name}
Tax ID (EIN): ${data.provider.taxId}
License #: ${data.provider.licenseNumber}
Address: ${data.provider.address}
Phone: ${data.provider.phone}

PATIENT INFORMATION
-------------------
Name: ${data.patient.name}
Date of Service: ${data.patient.dateOfService}

SERVICES RENDERED
-----------------
${data.services.map(s => `
${s.name} ${s.hsaFsaEligible ? '[HSA/FSA ELIGIBLE]' : ''}
${s.description}
Amount: $${s.amount.toFixed(2)}
${s.medicalNecessity ? `Medical Necessity: ${s.medicalNecessity}` : ''}
`).join('\n')}

FINANCIAL SUMMARY
-----------------
Subtotal: $${data.totals.subtotal.toFixed(2)}
Tax: $${data.totals.tax.toFixed(2)}
Total: $${data.totals.total.toFixed(2)}
HSA/FSA Eligible Amount: $${data.totals.hsaFsaEligible.toFixed(2)}

PAYMENT INFORMATION
-------------------
Payment Method: ${data.payment.method}
Payment Date: ${data.payment.date}
Transaction ID: ${data.payment.transactionId}

IIAS-90 SUBSTANTIATION STATEMENT
--------------------------------
${data.substantiation}

This is an official medical receipt. Please retain for your records.
    `.trim();

    const blob = new Blob([receiptText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `receipt-${data.receiptNumber}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="bg-white min-h-full">
      {/* Action Bar - Hidden when printing */}
      <div className="print:hidden sticky top-0 bg-white border-b p-4 flex justify-between items-center z-10">
        <h2 className="font-semibold text-lg">IIAS Receipt</h2>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          {onClose && (
            <Button variant="outline" size="sm" onClick={onClose}>
              Close
            </Button>
          )}
        </div>
      </div>

      {/* Receipt Content */}
      <div className="p-6 max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center py-6 border-b-2 border-gray-200">
          <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-8 h-8 text-purple-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Medical Services Receipt</h1>
          <p className="text-gray-500 text-sm mb-3">IIAS-Compliant</p>
          <div className="inline-flex items-center gap-2 bg-emerald-50 px-4 py-2 rounded-full">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-semibold text-emerald-700">HSA/FSA Eligible</span>
          </div>
        </div>

        {/* Receipt Number */}
        <div className="py-4 bg-gray-50 text-center my-4 rounded-xl">
          <p className="text-xs font-semibold text-gray-500 mb-1">Receipt #</p>
          <p className="text-lg font-bold text-gray-900 font-mono">{data.receiptNumber}</p>
        </div>

        {/* Provider Information */}
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-3">Service Provider</h3>
          <div className="space-y-2">
            <div className="flex py-1">
              <span className="w-28 text-sm font-semibold text-gray-500">Business Name:</span>
              <span className="flex-1 text-sm text-gray-900">{data.provider.name}</span>
            </div>
            <div className="flex py-1">
              <span className="w-28 text-sm font-semibold text-gray-500">Tax ID (EIN):</span>
              <span className="flex-1 text-sm text-gray-900">{data.provider.taxId}</span>
            </div>
            <div className="flex py-1">
              <span className="w-28 text-sm font-semibold text-gray-500">License #:</span>
              <span className="flex-1 text-sm text-gray-900">{data.provider.licenseNumber}</span>
            </div>
            <div className="flex py-1">
              <span className="w-28 text-sm font-semibold text-gray-500">Address:</span>
              <span className="flex-1 text-sm text-gray-900">{data.provider.address}</span>
            </div>
            <div className="flex py-1">
              <span className="w-28 text-sm font-semibold text-gray-500">Phone:</span>
              <span className="flex-1 text-sm text-gray-900">{data.provider.phone}</span>
            </div>
          </div>
        </div>

        {/* Patient Information */}
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-3">Patient Information</h3>
          <div className="space-y-2">
            <div className="flex py-1">
              <span className="w-28 text-sm font-semibold text-gray-500">Name:</span>
              <span className="flex-1 text-sm text-gray-900">{data.patient.name}</span>
            </div>
            <div className="flex py-1">
              <span className="w-28 text-sm font-semibold text-gray-500">Date of Service:</span>
              <span className="flex-1 text-sm text-gray-900">{data.patient.dateOfService}</span>
            </div>
          </div>
        </div>

        {/* Services Rendered */}
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-3">Medical Services Rendered</h3>
          <div className="space-y-3">
            {data.services.map((service, index) => (
              <div key={index} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-sm font-semibold text-gray-900">{service.name}</span>
                  {service.hsaFsaEligible && (
                    <span className="bg-emerald-100 text-emerald-700 text-xs font-semibold px-2 py-1 rounded">
                      Eligible
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                {service.medicalNecessity && (
                  <p className="text-xs text-gray-500 mb-2 italic">
                    Medical Necessity: {service.medicalNecessity}
                  </p>
                )}
                {service.units && service.pricePerUnit && (
                  <p className="text-xs text-gray-500 mb-1">
                    {service.units} units x ${service.pricePerUnit.toFixed(2)}/unit
                  </p>
                )}
                <p className="text-base font-bold text-purple-600 text-right">
                  ${service.amount.toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Financial Summary */}
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-3">Financial Summary</h3>
          <div className="space-y-2">
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">Subtotal:</span>
              <span className="text-sm font-semibold text-gray-900">
                ${data.totals.subtotal.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-sm text-gray-500">Tax:</span>
              <span className="text-sm font-semibold text-gray-900">
                ${data.totals.tax.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between py-3 border-t-2 border-gray-200 mt-2">
              <span className="text-base font-bold text-gray-900">Total Amount:</span>
              <span className="text-base font-bold text-gray-900">
                ${data.totals.total.toFixed(2)}
              </span>
            </div>
            {data.totals.hsaFsaEligible > 0 && (
              <div className="flex items-center gap-3 bg-emerald-50 p-4 rounded-xl mt-4">
                <Heart className="w-5 h-5 text-emerald-500" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-emerald-800 mb-1">
                    HSA/FSA Eligible Amount:
                  </p>
                  <p className="text-xl font-bold text-emerald-600">
                    ${data.totals.hsaFsaEligible.toFixed(2)}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Payment Information */}
        <div className="py-4 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900 mb-3">Payment Information</h3>
          <div className="space-y-2">
            <div className="flex py-1">
              <span className="w-28 text-sm font-semibold text-gray-500">Payment Method:</span>
              <span className="flex-1 text-sm text-gray-900">{data.payment.method}</span>
            </div>
            <div className="flex py-1">
              <span className="w-28 text-sm font-semibold text-gray-500">Payment Date:</span>
              <span className="flex-1 text-sm text-gray-900">{data.payment.date}</span>
            </div>
            <div className="flex py-1">
              <span className="w-28 text-sm font-semibold text-gray-500">Transaction ID:</span>
              <span className="flex-1 text-sm text-gray-900 font-mono">{data.payment.transactionId}</span>
            </div>
          </div>
        </div>

        {/* IIAS-90 Substantiation Statement */}
        <div className="bg-amber-50 p-4 rounded-xl my-4 border border-amber-200">
          <h3 className="text-sm font-bold text-amber-900 mb-2">IIAS-90 Substantiation Statement</h3>
          <p className="text-sm text-amber-800 leading-relaxed">{data.substantiation}</p>
          <p className="text-sm text-amber-800 leading-relaxed mt-3">
            This receipt contains all required information under the Inventory Information Approval
            System (IIAS) standards for substantiation of medical expenses. Retain this receipt for
            your tax records.
          </p>
        </div>

        {/* Provider Signature */}
        <div className="py-6">
          <div className="h-px bg-gray-300 mb-2" />
          <p className="text-sm text-gray-500 mb-1">Authorized Provider Signature</p>
          <p className="text-xs text-gray-400">Date: {data.patient.dateOfService}</p>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-500">
            For questions regarding this receipt, please contact {data.provider.phone}
          </p>
          <p className="text-sm text-gray-500 mt-2">
            This is an official medical receipt. Please retain for your records.
          </p>
        </div>
      </div>
    </div>
  );
}
