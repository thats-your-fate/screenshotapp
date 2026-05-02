export const FONT_OPTIONS = [
  { id: "space", label: "Space Grotesk", fontStack: "\"Space Grotesk\", sans-serif" },
  { id: "manrope", label: "Manrope", fontStack: "\"Manrope\", sans-serif" },
  { id: "inter", label: "Inter", fontStack: "\"Inter\", \"Segoe UI\", sans-serif" },
  { id: "poppins", label: "Poppins", fontStack: "\"Poppins\", \"Segoe UI\", sans-serif" },
  { id: "montserrat", label: "Montserrat", fontStack: "\"Montserrat\", \"Segoe UI\", sans-serif" },
  { id: "nunito", label: "Nunito", fontStack: "\"Nunito\", \"Segoe UI\", sans-serif" },
  { id: "lato", label: "Lato", fontStack: "\"Lato\", \"Helvetica Neue\", sans-serif" },
  { id: "oswald", label: "Oswald", fontStack: "\"Oswald\", \"Arial Narrow\", sans-serif" },
  { id: "fraunces", label: "Fraunces", fontStack: "\"Fraunces\", serif" },
  { id: "merriweather", label: "Merriweather", fontStack: "\"Merriweather\", serif" },
  { id: "playfair", label: "Playfair Display", fontStack: "\"Playfair Display\", Georgia, serif" },
  { id: "lora", label: "Lora", fontStack: "\"Lora\", Georgia, serif" },
  { id: "pt-serif", label: "PT Serif", fontStack: "\"PT Serif\", Georgia, serif" },
  { id: "roboto-mono", label: "Roboto Mono", fontStack: "\"Roboto Mono\", Menlo, monospace" },
] as const;

export type FontOptionId = (typeof FONT_OPTIONS)[number]["id"];

export function resolveFontFamily(fontId?: string) {
  const option = FONT_OPTIONS.find((item) => item.id === fontId);
  return option?.fontStack || "\"Space Grotesk\", sans-serif";
}
