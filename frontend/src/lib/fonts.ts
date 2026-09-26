import { Bricolage_Grotesque } from "next/font/google";

// Headline face for page titles and big numbers; body text stays on Inter.
export const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});
