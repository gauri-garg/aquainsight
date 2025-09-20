import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LineChart } from "lucide-react";

export default function AnalysisPage() {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
      <CardHeader>
        <div className="mx-auto bg-muted rounded-full p-4">
          <LineChart className="h-12 w-12 text-muted-foreground" />
        </div>
        <CardTitle className="mt-4">Analysis Module</CardTitle>
        <CardDescription>
          This feature is currently under development.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground max-w-md">
          The upcoming analysis module will allow for deep correlation studies
          between ocean parameters, biodiversity, and fish distribution. Stay
          tuned!
        </p>
      </CardContent>
    </Card>
  );
}
