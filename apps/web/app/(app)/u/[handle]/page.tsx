import type { Metadata } from "next";
import { PassportView } from "@/features/profile/components/passport-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ handle: string }>;
}): Promise<Metadata> {
  const { handle } = await params;
  return { title: `@${handle} · Passport · The Next Ship` };
}

// RSC shell: resuelve el handle de la ruta y delega en el feature (client),
// que lee el passport reactivamente vía Convex.
export default async function PassportPage({
  params,
}: {
  params: Promise<{ handle: string }>;
}) {
  const { handle } = await params;
  return <PassportView handle={handle} />;
}
