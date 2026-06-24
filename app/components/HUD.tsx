'use client'

interface Props { phase: number; progress: number }

const phaseNames = ['Singularity', 'Big Bang', 'Nebula', 'Spiral', 'Galaxy']

export default function HUD({ phase, progress }: Props) {
  const idx = Math.min(Math.floor(phase + 0.15), 4)

  return (
    <>
      {/* Top nav */}
      <nav className="fixed top-0 left-0 right-0 z-20 flex items-center justify-between px-10 py-6 pointer-events-none"
        style={{ background: 'linear-gradient(to bottom, rgba(4,3,10,0.6) 0%, transparent 100%)' }}>
        <span style={{ fontSize: 15, fontWeight: 600, letterSpacing: '-0.01em', color: 'rgba(255,255,255,0.9)' }}>
          galaxy<span style={{ color: '#ff6b2b' }}>.</span>
        </span>
        <span style={{ fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.2)' }}>
          Scroll to voyage
        </span>
      </nav>

      {/* Phase indicator — left side */}
      <div className="fixed left-8 top-1/2 -translate-y-1/2 z-20 pointer-events-none flex flex-col gap-3">
        {phaseNames.map((name, i) => (
          <div key={i} className="flex items-center gap-3">
            <div style={{
              width: i === idx ? 20 : 6,
              height: 1,
              background: i === idx ? '#ff6b2b' : 'rgba(255,255,255,0.15)',
              transition: 'width 0.5s ease, background 0.5s ease',
            }} />
            <span style={{
              fontSize: 9,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: i === idx ? 'rgba(255,255,255,0.55)' : 'rgba(255,255,255,0.12)',
              transition: 'color 0.5s ease',
            }}>
              {name}
            </span>
          </div>
        ))}
      </div>

      {/* Progress bar — bottom */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-20 pointer-events-none flex flex-col items-center gap-3">
        <div style={{
          width: 100, height: 1,
          background: 'rgba(255,255,255,0.08)',
          borderRadius: 1, overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: `${progress * 100}%`,
            background: 'linear-gradient(to right, #ff6b2b, #3b9eff)',
            transition: 'width 0.1s linear',
          }} />
        </div>
        <span style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.18)' }}>
          {Math.round(progress * 100)}% voyaged
        </span>
      </div>

      {/* Scroll hint — only at start */}
      {progress < 0.04 && (
        <div className="fixed bottom-24 left-1/2 scroll-bounce z-20 pointer-events-none flex flex-col items-center gap-2"
          style={{ transform: 'translateX(-50%)' }}>
          <span style={{ fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.22)' }}>
            Scroll
          </span>
          <svg width="12" height="16" viewBox="0 0 12 16" fill="none">
            <path d="M6 1v14M1 10l5 5 5-5" stroke="rgba(255,107,43,0.4)" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      )}

      {/* CTA — final phase */}
      {progress > 0.92 && (
        <div className="fixed bottom-20 left-1/2 z-20" style={{ transform: 'translateX(-50%)', opacity: Math.min((progress - 0.92) / 0.08, 1), transition: 'opacity 0.5s' }}>
          <button
            className="pointer-events-auto"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '14px 36px',
              background: 'linear-gradient(135deg, #ff6b2b, #cc3d0a)',
              color: '#fff', fontSize: 13, fontWeight: 500, letterSpacing: '0.03em',
              border: 'none', borderRadius: 100, cursor: 'pointer',
              boxShadow: '0 0 60px rgba(255,107,43,0.4), 0 0 120px rgba(255,107,43,0.15)',
            }}
          >
            Begin your voyage
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      )}

      {/* Coordinates — top right corner */}
      <div className="fixed top-6 right-10 z-20 pointer-events-none text-right">
        <div style={{ fontSize: 9, letterSpacing: '0.1em', color: 'rgba(255,255,255,0.15)', fontVariantNumeric: 'tabular-nums' }}>
          {(phase * 2400).toFixed(0)} ly · {(progress * 360).toFixed(1)}° · {phaseNames[idx].toUpperCase()}
        </div>
      </div>
    </>
  )
}
