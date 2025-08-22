import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { results } from "@/lib/data";

export default function ResultsPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Suivi des Résultats</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Résultats des Matchs</CardTitle>
          <CardDescription>
            Consultez les résultats des matchs passés de votre club.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {results.map((result) => (
              <AccordionItem key={result.id} value={`item-${result.id}`}>
                <AccordionTrigger>
                  <div className="flex justify-between w-full pr-4">
                    <span>
                      Club vs {result.opponent} -{" "}
                      <span className="text-muted-foreground">{result.date}</span>
                    </span>
                    <span className="font-bold text-primary">{result.score}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2">
                    <p>
                      <strong>Buteurs:</strong>{" "}
                      {result.scorers.length > 0
                        ? result.scorers.join(", ")
                        : "Aucun"}
                    </p>
                    <p>
                      <strong>Notes:</strong> {result.notes}
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
}
