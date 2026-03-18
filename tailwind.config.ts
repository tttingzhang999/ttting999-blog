import type { Config } from 'tailwindcss'

export default <Partial<Config>>{
  darkMode: 'class',
  content: [
    './components/**/*.{js,vue,ts}',
    './layouts/**/*.vue',
    './pages/**/*.vue',
    './plugins/**/*.{js,ts}',
    './app.vue',
    './error.vue'
  ],
  theme: {
    extend: {
      colors: {
        surface: {
          DEFAULT: 'var(--color-surface)',
          card: 'var(--color-surface-card)',
          elevated: 'var(--color-surface-elevated)'
        },
        foreground: {
          DEFAULT: 'var(--color-foreground)',
          muted: 'var(--color-foreground-muted)'
        },
        accent: {
          DEFAULT: 'var(--color-accent)',
          hover: 'var(--color-accent-hover)',
          alt: 'var(--color-accent-alt)',
          'alt-hover': 'var(--color-accent-alt-hover)'
        },
        border: {
          DEFAULT: 'var(--color-border)',
          muted: 'var(--color-border-muted)'
        }
      },
      fontFamily: {
        sans: ['Inter', 'Noto Sans TC', 'system-ui', 'sans-serif'],
        mono: ['monospace']
      },
      typography: () => ({
        DEFAULT: {
          css: {
            '--tw-prose-body': 'var(--color-foreground)',
            '--tw-prose-headings': 'var(--color-foreground)',
            '--tw-prose-links': 'var(--color-accent-alt)',
            '--tw-prose-bold': 'var(--color-foreground)',
            '--tw-prose-counters': 'var(--color-foreground-muted)',
            '--tw-prose-bullets': 'var(--color-foreground-muted)',
            '--tw-prose-hr': 'var(--color-border)',
            '--tw-prose-quotes': 'var(--color-foreground)',
            '--tw-prose-quote-borders': 'var(--color-accent)',
            '--tw-prose-captions': 'var(--color-foreground-muted)',
            '--tw-prose-code': 'var(--color-accent)',
            '--tw-prose-th-borders': 'var(--color-border)',
            '--tw-prose-td-borders': 'var(--color-border-muted)',
            color: 'var(--color-foreground)',
            a: {
              color: 'var(--color-accent-alt)',
              '&:hover': {
                color: 'var(--color-accent-alt-hover)'
              }
            },
            'h1, h2, h3, h4': {
              color: 'var(--color-foreground)'
            },
            'h1 a, h2 a, h3 a, h4 a': {
              color: 'inherit',
              textDecoration: 'none',
              '&:hover': {
                color: 'inherit'
              }
            },
            blockquote: {
              color: 'var(--color-foreground)',
              borderLeftColor: 'var(--color-accent)',
              borderLeftWidth: '4px',
              fontStyle: 'italic'
            },
            code: {
              color: 'var(--color-accent)',
              backgroundColor: 'var(--color-surface-elevated)',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '600'
            },
            'code::before': {
              content: '""'
            },
            'code::after': {
              content: '""'
            },
            hr: {
              borderColor: 'var(--color-border)',
              textAlign: 'center',
              border: 'none',
              '&::before': {
                content: '"~ ~ ~"',
                display: 'block',
                color: 'var(--color-foreground-muted)',
                letterSpacing: '0.5em',
                fontSize: '0.875rem'
              }
            },
            'pre code': {
              backgroundColor: 'transparent'
            }
          }
        }
      }),
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out'
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ]
}
