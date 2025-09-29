
"use client";

import { useAuth } from "@/hooks/use-auth";
import { CMLREDashboard } from "./cmlre-dashboard";
import { UserDashboard } from "./user-dashboard";
import { Loader2 } from "lucide-react";

export default function Dashboard() {
  const { role, loading } = useAuth();

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

  if (role === 'User') {
    return <UserDashboard />;
  }

  return (
    <div className="flex items-center justify-center h-full text-center">
      <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl">
        Welcome to AquaInsight
      </h1>
      <p className="max-w-[600px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed mt-4">
        Please contact support if your role is not assigned.
      </p>
    </div>
  );
}
