import { Card } from "@/components/ui/card";
import type { Doc } from "@thenextcraft/backend/dataModel";

// Recordatorio de criterios en el ship. Presentacional: recibe el reto ya
// cargado (o undefined mientras carga). El builder mapea su solución a estos
// criterios antes de shipear.
export function CriteriaSidebar({
  challenge,
}: {
  challenge: Doc<"challenges"> | null | undefined;
}) {
  const criteria = challenge?.successCriteria ?? [];

  return (
    <Card className="bg-panel-2 sticky top-20 gap-0 self-start p-[22px]">
      <div className="text-sm font-semibold">Recordatorio — criterios</div>

      <div className="mt-3 flex flex-col gap-2.5">
        {criteria.length > 0 ? (
          criteria.map((c, i) => (
            <div key={i} className="flex items-start gap-2.5 text-[13.5px]">
              <span className="text-sage mt-0.5">✓</span>
              <span>{c}</span>
            </div>
          ))
        ) : (
          <p className="text-muted-foreground m-0 text-[13px]">
            {challenge === undefined
              ? "Cargando criterios…"
              : "Este reto no listó criterios."}
          </p>
        )}
      </div>

      <div className="border-line my-4 border-t" />

      <div className="bg-ink-2 border-line rounded-xl border p-4">
        <p className="text-muted-foreground m-0 text-[12.5px]">
          Evaluamos el LINK + tu autoría, no ejecutamos código. La IA rankea; la
          startup decide.
        </p>
      </div>
    </Card>
  );
}
