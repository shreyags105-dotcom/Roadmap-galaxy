import plugin from 'tailwindcss/plugin';
import { palette, toRgbTriplet } from './src/config/palette.js';

/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    // `colors` is REPLACED (not extended) so default purples, greens, greys etc. cannot be used.
    colors: { transparent: 'transparent', current: 'currentColor', ...palette, gray: { 400: palette.starlight } },
    // Tailwind's preflight reads these two keys for placeholder text and ring offsets and would
    // otherwise fall back to built-in grey and white values. Both are mapped to palette colours.
    ringOffsetColor: { DEFAULT: palette.void },
    fontFamily: {
      heading: ['"Space Grotesk"', 'system-ui', 'sans-serif'],
      body: ['Figtree', 'system-ui', 'sans-serif'],
      mono: ['"Space Mono"', 'ui-monospace', 'monospace'],
    },
    extend: {
      boxShadow: { glow: '0 0 28px rgb(59 130 246 / 0.4)', sun: '0 0 26px rgb(255 200 61 / 0.45)' },
      keyframes: { enter: { from: { opacity: '0', transform: 'translateY(8px)' } } },
      animation: { enter: 'enter .35s ease both' },
    },
  },
  plugins: [
    plugin(({ addBase }) => {
      const vars = {};
      for (const [name, hex] of Object.entries(palette)) {
        vars[`--${name}`] = hex;
        vars[`--${name}-rgb`] = toRgbTriplet(hex);
      }
      addBase({ ':root': vars });
    }),
  ],
};
