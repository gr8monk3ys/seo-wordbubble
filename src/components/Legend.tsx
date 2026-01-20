import type { SearchIntent } from '@/types/keywords'
import { INTENT_COLORS, INTENT_LABELS } from '@/lib/constants'

interface LegendProps {
  className?: string
}

export function Legend({ className = '' }: LegendProps): JSX.Element {
  return (
    <div className={`flex flex-wrap gap-4 justify-center ${className}`}>
      <div className="text-sm font-medium text-gray-600 mr-2">Search Intent:</div>
      {(Object.keys(INTENT_COLORS) as SearchIntent[]).map(intent => (
        <div key={intent} className="flex items-center gap-2">
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: INTENT_COLORS[intent] }}
            data-testid={`legend-color-${intent}`}
          />
          <span className="text-sm text-gray-700">{INTENT_LABELS[intent]}</span>
        </div>
      ))}
      <div className="w-full flex justify-center gap-4 mt-2">
        <div className="text-sm text-gray-500">
          Opacity indicates difficulty: solid = low, faded = high
        </div>
      </div>
    </div>
  )
}
