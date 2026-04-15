import { useClickSound } from '../hooks/useClickSound'

interface Props {
  selectedYear: string
  onSelect: (year: string) => void
  loading: boolean
}

export function YearSelector({ selectedYear, onSelect, loading }: Props) {
  const currentYear = new Date().getFullYear()
  const years = ['last', ...Array.from({ length: 6 }, (_, i) => String(currentYear - i))]
  const playClick = useClickSound()

  return (
    <div className="field-row" style={{ gap: 2, flexWrap: 'wrap' }}>
      {years.map(year => (
        <button
          key={year}
          onClick={() => { playClick(); onSelect(year) }}
          disabled={loading}
          style={{
            minWidth: 0,
            padding: '2px 8px',
            fontSize: 11,
            fontWeight: year === selectedYear ? 'bold' : 'normal',
            ...(year === selectedYear ? {
              borderTop: '2px solid #0a0a0a',
              borderLeft: '2px solid #0a0a0a',
              borderRight: '2px solid #dfdfdf',
              borderBottom: '2px solid #dfdfdf',
            } : {}),
          }}
        >
          {year === 'last' ? 'Last 12m' : year}
        </button>
      ))}
    </div>
  )
}
