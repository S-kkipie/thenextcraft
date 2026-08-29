import type { Metadata } from "next";
import { IBM_Plex_Mono, Nunito } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

/*
 * Dos sistemas tipográficos conviven a propósito:
 *
 *  - La app corre en IBM Plex Mono de punta a punta (ADN de thenextcraft.org).
 *  - La landing usa el display redondeado de docs/design-foundation.html. El
 *    archivo pide `ui-rounded`, que solo existe en Apple; Nunito es la
 *    equivalente real y se ve igual en Windows.
 */
const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["600", "700", "800", "900"],
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
      className={`dark ${plexMono.variable} ${nunito.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
