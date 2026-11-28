// Single source of truth for colour. Tailwind (tailwind.config.js) and the CSS variables
// injected into :root both read from here. No other colours are permitted anywhere.
export const palette = {
  void: '#020617',
  cobalt: '#0F1F5C',
  electric: '#3B82F6',
  ice: '#BAE6FD',
  starlight: '#F1F5FF',
  sun: '#FFC83D',
  error: '#FF6B8B', // errors only
};

export const toRgbTriplet = (hex) =>
  [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)).join(' ');
