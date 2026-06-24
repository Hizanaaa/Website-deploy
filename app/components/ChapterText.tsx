'use client'

interface Chapter {
  eyebrow: string
  headline: string[]
  sub: string
  accentColor: 'orange' | 'blue' | 'mixed'
}

const CHAPTERS: Chapter[] = [
  {
    eyebrow: 'In the beginning',
    headline: ['A single', 'point of light.'],
    sub: 'Everything that will ever exist collapses to a singularity no wider than a thought. The universe holds its breath.',
    accentColor: 'orange',
  },
  {
    eyebrow: 'The big bang',
    headline: ['Then it', 'all ignites.'],
    sub: 'In an instant of impossible heat, 120,000 particles of orange fire tear outward into the void at the speed of creation.',
    accentColor: 'orange',
  },
  {
    eyebrow: 'The nebula',
    headline: ['Gravity', 'whispers.'],
    sub: 'Scattered clouds of gas and dust begin to feel each other\'s pull. The cosmos breathes slowly inward. Something is coming.',
    accentColor: 'blue',
  },
  {
    eyebrow: 'Formation',
    headline: ['The spiral', 'awakens.'],
    sub: 'Arms of light curl across ten thousand light-years. Five billion years of chaos resolving into breathtaking order.',
    accentColor: 'mixed',
  },
  {
    eyebrow: 'The galaxy',
    headline: ['You are made', 'of this.'],
    sub: 'Every atom in your body was forged in the heart of a dying star. You are the universe, experiencing itself.',
    accentColor: 'blue',
  },
]

interface Props {
  phase: number
}

export default function ChapterText({ phase }: Props) {
  const chapterIndex = Math.min(Math.floor(phase + 0.15), 4)
  const frac = phase - Math.floor(phase)
  const isTransitioning = frac < 0.12 && phase > 0.1

  return (
    <div className="fixed inset-0 z-10 pointer-events-none flex items-center justify-center">
      {CHAPTERS.map((ch, i) => {
        const visible = i === chapterIndex && !isTransitioning
        return (
          <div
            key={i}
            className={`chapter-text absolute text-center px-6 ${visible ? 'visible' : ''}`}
            style={{ maxWidth: 640 }}
          >
            <p style={{
              fontSize: 10,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.3)',
              marginBottom: 18,
              fontWeight: 400,
            }}>
              {ch.eyebrow}
            </p>
            <h2 style={{
              fontFamily: 'system-ui, sans-serif',
              fontSize: 'clamp(44px, 7vw, 92px)',
              fontWeight: 700,
              lineHeight: 0.97,
              letterSpacing: '-0.035em',
              marginBottom: 22,
            }}>
              {ch.headline.map((line, li) => (
                <span key={li} style={{ display: 'block' }}>
                  <span style={{
                    background: li === ch.headline.length - 1
                      ? ch.accentColor === 'orange'
                        ? 'linear-gradient(135deg, #fff 20%, #ff6b2b 100%)'
                        : ch.accentColor === 'blue'
                        ? 'linear-gradient(135deg, #fff 20%, #3b9eff 100%)'
                        : 'linear-gradient(135deg, #ff6b2b 0%, #fff 50%, #3b9eff 100%)'
                      : 'none',
                    WebkitBackgroundClip: li === ch.headline.length - 1 ? 'text' : undefined,
                    WebkitTextFillColor: li === ch.headline.length - 1 ? 'transparent' : 'rgba(255,255,255,0.95)',
                    backgroundClip: li === ch.headline.length - 1 ? 'text' : undefined,
                    color: li !== ch.headline.length - 1 ? 'rgba(255,255,255,0.95)' : undefined,
                  }}>{line}</span>
                </span>
              ))}
            </h2>
            <p style={{
              fontSize: 15,
              color: 'rgba(255,255,255,0.42)',
              lineHeight: 1.85,
              maxWidth: 400,
              margin: '0 auto',
              fontWeight: 300,
            }}>
              {ch.sub}
            </p>
          </div>
        )
      })}
    </div>
  )
}
