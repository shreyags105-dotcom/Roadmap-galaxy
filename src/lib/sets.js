export const toSet = (v) => (v instanceof Set ? v : new Set(v ?? []));
