
"use client";

import Link from "next/link";
import { Home, Menu, FlaskConical, Database, BrainCircuit, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/hooks/use-auth";
import { DynamicDatasetNav } from "@/components/dataset-nav-dynamic";
import React from "react";
import { GlobalSearch } from "@/components/global-search";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = useAuth();

  const SidebarNav = () => (
    <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
      <Link
        href="/dashboard"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <Home className="h-4 w-4" />
        Dashboard
      </Link>
      
      {role === 'CMLRE' && (
         <Link
          href="/dashboard/datasets"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Database className="h-4 w-4" />
          Manage Datasets
        </Link>
      )}

      <Link
        href="/dashboard/edna-matching"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <FlaskConical className="h-4 w-4" />
        eDNA Matching
      </Link>
      <Link
        href="/dashboard/ai-analysis"
        className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
      >
        <BrainCircuit className="h-4 w-4" />
        AI Analysis
      </Link>
      {(role === 'Student' || role === 'Researcher') && (
        <Link
          href="/dashboard/submit-data"
          className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
        >
          <Upload className="h-4 w-4" />
          Submit Data
        </Link>
      )}

      <React.Suspense fallback={<div className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground">Loading datasets...</div>}>
         <DynamicDatasetNav />
      </React.Suspense>
    </nav>
  );

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <FlaskConical className="h-6 w-6 text-primary" />
              <span>AquaInsight</span>
            </Link>
          </div>
          <div className="flex-1">
            <SidebarNav />
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  href="#"
                  className="flex items-center gap-2 text-lg font-semibold mb-4"
                >
                  <FlaskConical className="h-6 w-6 text-primary" />
                  <span >AquaInsight</span>
                </Link>
                <Link
                  href="/dashboard"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
                 {role === 'CMLRE' && (
                  <Link
                    href="/dashboard/datasets"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl bg-muted px-3 py-2 text-foreground hover:text-foreground"
                  >
                    <Database className="h-5 w-5" />
                    Manage Datasets
                  </Link>
                )}
                <Link
                  href="/dashboard/edna-matching"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <FlaskConical className="h-5 w-5" />
                  eDNA Matching
                </Link>
                <Link
                  href="/dashboard/ai-analysis"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <BrainCircuit className="h-5 w-5" />
                  AI Analysis
                </Link>
                {(role === 'Student' || role === 'Researcher') && (
                  <Link
                    href="/dashboard/submit-data"
                    className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                  >
                      <Upload className="h-5 w-5" />
                      Submit Data
                  </Link>
                )}
                 <React.Suspense fallback={<div className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground">Loading...</div>}>
                    <DynamicDatasetNav isMobile={true} />
                 </React.Suspense>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <GlobalSearch />
          </div>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
