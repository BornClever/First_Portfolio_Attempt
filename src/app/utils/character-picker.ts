export const nextLetter = (current: string): string => {
  const code = current.charCodeAt(0);
  return code >= 90 ? 'A' : String.fromCharCode(code + 1);
};

export const prevLetter = (current: string): string => {
  const code = current.charCodeAt(0);
  return code <= 65 ? 'Z' : String.fromCharCode(code - 1);
};

export const incrementNumber = (current: number): number => {
  return (current + 1) % 11;
};

export const decrementNumber = (current: number): number => {
  return current === 0 ? 10 : current - 1;
};

export const getFontFamily = (style: string): string => {
  switch (style) {
    case 'Silkscreen': return "'Silkscreen:Bold', Courier, monospace";
    case 'Press Start 2P': return "'Press Start 2P', Courier, monospace";
    case 'VT323': return "'VT323', Courier, monospace";
    case 'Orbitron': return "'Orbitron', sans-serif";
    case 'IBM Plex Mono': return "'IBM Plex Mono', monospace";
    case 'Share Tech Mono': return "'Share Tech Mono', monospace";
    default: return "'Silkscreen:Bold', Courier, monospace";
  }
};