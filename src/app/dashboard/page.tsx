
"use client";

import { useAuth } from "@/hooks/use-auth";

export default function Dashboard() {
  const { role, userDetails } = useAuth();

  const getTitle = () => {
    switch (role) {
      case "Student":
        return `Welcome, ${userDetails?.fullName || 'Student'}!`;
      case "Researcher":
        return `Welcome, ${userDetails?.fullName || 'Researcher'}!`;
      case "CMLRE":
        return "CMLRE Staff Dashboard";
      default:
        return "Dashboard";
    }
  };
   const getDescription = () => {
    switch (role) {
      case "Student":
        return "Explore datasets and expand your knowledge.";
      case "Researcher":
        return "Access data and tools for your research projects.";
      case "CMLRE":
        return "Manage datasets, review submissions, and oversee the platform.";
      default:
        return "Welcome to the AquaInsight platform.";
    }
  };


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
