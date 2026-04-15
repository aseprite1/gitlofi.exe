import type { MusicKit } from '../lib/sampleManifest'

interface Props {
  kit: MusicKit | null
  vinylFile: string | null
}

export function SampleInfo({ kit, vinylFile }: Props) {
  if (!kit) return null

  return (
    <div style={{ padding: 4, fontSize: 11 }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <tbody>
          <Row label="Melody" value={kit.layers['full'] ?? '—'} />
          {kit.layers['keys'] && <Row label="Keys" value={kit.layers['keys']} />}
          {kit.layers['bass'] && <Row label="Bass" value={kit.layers['bass']} />}
          {vinylFile && <Row label="Vinyl" value={vinylFile} />}
          <Row label="Kit" value={`${kit.mood} · ${kit.bpm} BPM · Key of ${kit.key}`} highlight />
        </tbody>
      </table>
    </div>
  )
}

function Row({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <tr>
      <td style={{ padding: '1px 6px 1px 0', fontWeight: 'bold', color: '#5c4a32', whiteSpace: 'nowrap', verticalAlign: 'top' }}>
        {label}:
      </td>
      <td style={{
        padding: '1px 0',
        color: highlight ? '#c87941' : '#808080',
        fontFamily: 'monospace',
        fontSize: 10,
        wordBreak: 'break-all',
      }}>
        {value}
      </td>
    </tr>
  )
}
