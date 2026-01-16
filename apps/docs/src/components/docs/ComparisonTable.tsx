import { Check, X, Minus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ComparisonRow {
  feature: string
  luxe: boolean | 'partial' | string
  mangomint?: boolean | 'partial' | string
  boulevard?: boolean | 'partial' | string
  jane?: boolean | 'partial' | string
}

interface ComparisonTableProps {
  rows: ComparisonRow[]
  showCompetitors?: boolean
}

function FeatureValue({ value }: { value: boolean | 'partial' | string }) {
  if (value === true) {
    return <Check className="w-5 h-5 text-green-500" />
  }
  if (value === false) {
    return <X className="w-5 h-5 text-gray-300" />
  }
  if (value === 'partial') {
    return <Minus className="w-5 h-5 text-yellow-500" />
  }
  return <span className="text-sm text-gray-600">{value}</span>
}

export function ComparisonTable({ rows, showCompetitors = false }: ComparisonTableProps) {
  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b-2 border-gray-200">
            <th className="text-left py-3 px-4 font-semibold text-gray-700">Feature</th>
            <th className="text-center py-3 px-4 font-semibold">
              <span className="gradient-text">Luxe MedSpa</span>
            </th>
            {showCompetitors && (
              <>
                <th className="text-center py-3 px-4 font-semibold text-gray-500">Mangomint</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-500">Boulevard</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-500">Jane App</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className={cn('border-b border-gray-100', index % 2 === 0 && 'bg-gray-50/50')}>
              <td className="py-3 px-4 text-gray-700">{row.feature}</td>
              <td className="py-3 px-4 text-center">
                <div className="flex justify-center">
                  <FeatureValue value={row.luxe} />
                </div>
              </td>
              {showCompetitors && (
                <>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <FeatureValue value={row.mangomint ?? false} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <FeatureValue value={row.boulevard ?? false} />
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center">
                      <FeatureValue value={row.jane ?? false} />
                    </div>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
