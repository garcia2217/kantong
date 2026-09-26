import { Bricolage_Grotesque } from "next/font/google";

// Headline face for the marketing page only; app screens stay on Inter.
export const displayFont = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});
