import { ALL_GENRES, type Genre, type GenreConfig } from '../lib/genres'
import type { LanguageFamily } from '../lib/languages'

interface Props {
  selectedGenre: Genre
  genreConfig: GenreConfig
  languageFamily?: LanguageFamily
  topLanguage?: string
  onSelect: (genre: Genre) => void
}

const GENRE_ICONS: Record<Genre, string> = {
  hiphop: '🎤',
  lofi: '🌧️',
  techno: '⚡',
  jazz: '🎷',
}

const GENRE_LABELS: Record<Genre, string> = {
  hiphop: 'Hip-Hop',
  lofi: 'Lo-Fi',
  techno: 'Techno',
  jazz: 'Jazz',
}

export function GenreSelector({ selectedGenre, genreConfig, languageFamily, topLanguage, onSelect }: Props) {
  return (
    <div style={styles.container}>
      <div style={styles.genreRow}>
        {ALL_GENRES.map(genre => (
          <button
            key={genre}
            onClick={() => onSelect(genre)}
            style={{
              ...styles.genreBtn,
              ...(genre === selectedGenre ? styles.genreBtnActive : {}),
            }}
          >
            <span style={styles.icon}>{GENRE_ICONS[genre]}</span>
            <span style={styles.label}>{GENRE_LABELS[genre]}</span>
          </button>
        ))}
      </div>
      <div style={styles.info}>
        {topLanguage && topLanguage !== 'Unknown' && (
          <span style={styles.langBadge}>
            {topLanguage} → {languageFamily}
          </span>
        )}
        <span style={styles.configInfo}>
          {genreConfig.defaultBpm} BPM · swing {Math.round(genreConfig.swing * 100)}% · reverb {Math.round(genreConfig.reverbMix * 100)}%
        </span>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
  },
  genreRow: {
    display: 'flex',
    gap: 6,
    flexWrap: 'wrap',
  },
  genreBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 16px',
    background: '#161b22',
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: '#30363d',
    borderRadius: 8,
    color: '#7d8590',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  genreBtnActive: {
    background: '#1f6feb22',
    borderColor: '#58a6ff',
    color: '#e6edf3',
    boxShadow: '0 0 12px rgba(88, 166, 255, 0.15)',
  },
  icon: {
    fontSize: 16,
  },
  label: {},
  info: {
    display: 'flex',
    gap: 12,
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  langBadge: {
    fontSize: 11,
    padding: '3px 8px',
    background: '#0e442922',
    border: '1px solid #0e4429',
    borderRadius: 12,
    color: '#39d353',
    fontFamily: 'ui-monospace, monospace',
  },
  configInfo: {
    fontSize: 11,
    color: '#484f58',
    fontFamily: 'ui-monospace, monospace',
  },
}
