"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Fish } from "lucide-react";

export default function FisheriesPage() {
  return (
    <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
      <CardHeader>
        <div className="mx-auto bg-muted rounded-full p-4">
          <Fish className="h-12 w-12 text-muted-foreground" />
        </div>
        <CardTitle className="mt-4">Fisheries Data</CardTitle>
        <CardDescription>
          This feature is currently under development.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground max-w-md">
          The upcoming fisheries module will provide detailed analytics on catch data, species distribution, and stock assessments.
        </p>
      </CardContent>
    </Card>
  );
}
