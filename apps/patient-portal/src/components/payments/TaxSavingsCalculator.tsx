'use client';

import { useState } from 'react';
import { Calculator, TrendingDown, Lightbulb } from 'lucide-react';

interface TaxSavingsCalculatorProps {
  eligibleAmount: number;
}

export default function TaxSavingsCalculator({ eligibleAmount }: TaxSavingsCalculatorProps) {
  const [taxBracket, setTaxBracket] = useState(25);

  const federalSavings = eligibleAmount * (taxBracket / 100);
  // Approximate state tax (average ~5%)
  const stateSavings = eligibleAmount * 0.05;
  // FICA savings (7.65% for most employees)
  const ficaSavings = eligibleAmount * 0.0765;
  const totalSavings = federalSavings + stateSavings + ficaSavings;
  const netCost = eligibleAmount - totalSavings;

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
          <Calculator className="w-5 h-5 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900">Tax Savings Calculator</h3>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Federal Tax Bracket
        </label>
        <select
          value={taxBracket}
          onChange={(e) => setTaxBracket(Number(e.target.value))}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
        >
          <option value={10}>10% ($0 - $11,600)</option>
          <option value={12}>12% ($11,601 - $47,150)</option>
          <option value={22}>22% ($47,151 - $100,525)</option>
          <option value={24}>24% ($100,526 - $191,950)</option>
          <option value={25}>25% (Custom)</option>
          <option value={32}>32% ($191,951 - $243,725)</option>
          <option value={35}>35% ($243,726 - $609,350)</option>
          <option value={37}>37% ($609,351+)</option>
        </select>
      </div>

      <div className="bg-white rounded-lg p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">HSA/FSA Eligible Amount:</span>
          <span className="font-semibold text-gray-900">${eligibleAmount.toFixed(2)}</span>
        </div>

        <div className="border-t border-gray-100 pt-3 space-y-2">
          <div className="flex justify-between items-center text-green-600">
            <span className="text-sm">Federal Tax Savings ({taxBracket}%):</span>
            <span className="font-medium">-${federalSavings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-green-600">
            <span className="text-sm">Est. State Tax Savings (~5%):</span>
            <span className="font-medium">-${stateSavings.toFixed(2)}</span>
          </div>
          <div className="flex justify-between items-center text-green-600">
            <span className="text-sm">FICA Savings (7.65%):</span>
            <span className="font-medium">-${ficaSavings.toFixed(2)}</span>
          </div>
        </div>

        <div className="border-t-2 border-gray-200 pt-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-gray-900">Total Tax Savings:</span>
          </div>
          <span className="font-bold text-green-600 text-lg">${totalSavings.toFixed(2)}</span>
        </div>

        <div className="bg-purple-50 rounded-lg p-3 flex justify-between items-center">
          <span className="font-semibold text-purple-900">Your Net Cost:</span>
          <span className="font-bold text-purple-600 text-xl">${netCost.toFixed(2)}</span>
        </div>
      </div>

      <div className="flex items-start gap-2 mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
        <Lightbulb className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-amber-800">
          <p className="font-medium mb-1">Did you know?</p>
          <p>
            By using your HSA/FSA card for eligible medical expenses, you effectively save{' '}
            <span className="font-semibold">{Math.round((totalSavings / eligibleAmount) * 100)}%</span>{' '}
            on your out-of-pocket costs!
          </p>
        </div>
      </div>
    </div>
  );
}
