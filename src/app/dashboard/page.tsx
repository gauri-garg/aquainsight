
"use client";

import { useAuth } from "@/hooks/use-auth";
import { CMLREDashboard } from "./cmlre-dashboard";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { role, userDetails, loading } = useAuth();

  const getTitle = () => {
    switch (role) {
      case "Student":
        return `Welcome, ${userDetails?.fullName || 'Student'}!`;
      case "Researcher":
        return `Welcome, ${userDetails?.fullName || 'Researcher'}!`;
      case "CMLRE":
        // CMLRE will have its own component, but we can have a fallback
        return "CMLRE Staff Dashboard";
      default:
        return "Dashboard";
    }
  };

  const getDescription = () => {
    switch (role) {
      case "Student":
        return "Explore datasets, submit your findings, and contribute to marine science.";
      case "Researcher":
        return "Access data, analyze trends, and collaborate with a community of scientists.";
      case "CMLRE":
        return "Manage datasets, review submissions, and oversee the platform's health.";
      default:
        return "Welcome to the AquaInsight platform.";
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (role === 'CMLRE') {
    return <CMLREDashboard />;
  }

  return (
    <div className="flex flex-col items-center justify-center h-full text-center">
      <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
        {getTitle()}
      </h1>
      <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
        {getDescription()}
      </p>
    </div>
  );
}
