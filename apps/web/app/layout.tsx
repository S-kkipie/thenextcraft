import type { Metadata } from "next";
import { IBM_Plex_Mono, Silkscreen } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "@/components/ui/sonner";

// ADN thenextcraft.org: la app entera corre en Plex Mono (terminal);
// Silkscreen es el display bitmap de arcade que usa la landing.
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
  title: "The Next Ship",
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
        <Toaster />
      </body>
    </html>
  );
}
