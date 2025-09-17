export const getRiskColor = (level: string): [string, string] => {
  switch (level) {
    case "Low":
      return ["#22C55E", "#16A34A"]; // vibrant greens
    case "Moderate":
      return ["#FACC15", "#F59E0B"]; // yellow
    case "Elevated":
      return ["#FFB020", "#E67E22"]; // warmer yellow/orange
    case "High":
      return ["#FF5A5F", "#C92A2A"]; // reds
    default:
      return ["#9CA3AF", "#6B7280"]; // gray fallback
  }
};

export const getScreenGradient = (level: string): [string, string] => {
  switch (level) {
    case "Low":
      return ["#0F1F17", "#0A2A18"]; // deep green-tinted darks
    case "Moderate":
      return ["#1A160A", "#221B0A"]; // warm amber-tinted darks
    case "Elevated":
      return ["#20160A", "#2A1B0A"]; // slightly stronger amber/orange tint
    case "High":
      return ["#1A0F0F", "#220A0A"]; // red-tinted darks
    default:
      return ["#111111", "#1a1a1a"]; // neutral darks
  }
};

export const hexToRgba = (hex: string, alpha: number): string => {
  let c = hex.replace("#", "");
  if (c.length === 3)
    c = c
      .split("")
      .map((x) => x + x)
      .join("");
  const r = parseInt(c.substring(0, 2), 16);
  const g = parseInt(c.substring(2, 4), 16);
  const b = parseInt(c.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};
