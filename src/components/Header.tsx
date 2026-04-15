export function Header() {
  return (
    <div style={styles.header}>
      <div style={styles.logo}>
        <img src="/favicon.svg" alt="gitlofi" style={styles.icon} />
        <div>
          <span style={styles.title}>gitlofi</span>
          <span style={styles.exe}>.exe</span>
        </div>
      </div>
      <p style={styles.tagline}>Turn your GitHub contributions into lo-fi beats</p>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    textAlign: 'center',
    padding: '6px 0',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  icon: {
    width: 36,
    height: 36,
    imageRendering: 'pixelated',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#5c4a32',
  },
  exe: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#8b7355',
  },
  tagline: {
    color: '#8b7355',
    fontSize: 11,
    marginTop: 2,
  },
}
