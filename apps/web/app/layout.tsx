import type { Metadata } from "next";
import { IBM_Plex_Mono, Silkscreen } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/*
 * Dos sistemas tipográficos conviven a propósito:
 *
 *  - La app corre en IBM Plex Mono de punta a punta (ADN de thenextcraft.org).
 *  - La landing usa Silkscreen para display: bitmap de arcade. El body también
 *    es Plex Mono, así que la landing entera queda en terminal.
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

export const metadata: Metadata = {
  title: "thenextcraft",
  description:
    "Proof-of-work hiring: resuelve retos de negocio reales, shipea, y que te contraten por lo que construiste.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${plexMono.variable} ${silkscreen.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
