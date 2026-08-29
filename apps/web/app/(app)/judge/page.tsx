import { AlertTriangle, KeyRound } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JudgeScreen } from "@/features/technical-judge/components/judge-screen";

export default function JudgePage() {
  if (!process.env.NEXT_PUBLIC_CONVEX_URL) {
    return (
      <main className="mx-auto max-w-2xl py-16">
        <Card className="border-amber-500/30">
          <CardHeader>
            <Badge variant="outline" className="mb-2">
              <AlertTriangle data-icon="inline-start" />
              Setup requerido
            </Badge>
            <CardTitle className="flex items-center gap-2 text-xl">
              <KeyRound className="size-5" />
              Conecta el frontend con Convex
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
            <p>Crea <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">apps/web/.env.local</code> y define <code className="rounded bg-muted px-1.5 py-0.5 text-foreground">NEXT_PUBLIC_CONVEX_URL</code>.</p>
            <p>La clave de OpenAI se configura únicamente en el deployment de Convex, nunca en el navegador.</p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return <JudgeScreen />;
}
