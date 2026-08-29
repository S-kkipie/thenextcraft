import type { Metadata } from "next";
import { Borel, IBM_Plex_Mono, Silkscreen } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/*
 * Tipografía tomada de thenextcraft.org: el sitio es mono de punta a punta.
 * Plex Mono carga todo el texto; Silkscreen son los números bitmap del contador
 * C64; Borel es la manuscrita del wordmark. Tres roles, ningún sans.
 */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const silkscreen = Silkscreen({
  variable: "--font-silkscreen",
  subsets: ["latin"],
  weight: ["400", "700"],
});

const borel = Borel({
  variable: "--font-borel",
  subsets: ["latin"],
  weight: "400",
});

export const metadata: Metadata = {
  title: "thenextcraft",
  description:
    "Proof-of-work hiring: resuelve retos de negocio reales, shipea, y que te contraten por lo que construiste.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${plexMono.variable} ${silkscreen.variable} ${borel.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
