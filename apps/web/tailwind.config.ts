import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        paper: '#FAF9F5',
        ink: '#1E1D1B',
        leaf: {
          DEFAULT: '#2F5233',
          light: '#E7EEE4',
          dark: '#20391F',
        },
        sticker: {
          DEFAULT: '#E2562B',
          light: '#FCE7DD',
        },
        slate: {
          DEFAULT: '#6B7268',
          light: '#F1F0EA',
        },
        line: '#E4E1D8',
        // Backwards-compatible alias used by earlier components.
        brand: {
          DEFAULT: '#2F5233',
          light: '#E7EEE4',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'monospace'],
      },
    },
  },
  plugins: [],
};
export default config;
