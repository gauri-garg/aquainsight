
"use client";

import Link from "next/link";
import {
  Bell,
  FlaskConical,
  Home,
  LineChart,
  Upload,
  Dna,
  CheckCircle,
  Search,
  Menu,
  Users,
  Wind,
  Beaker,
  Thermometer,
  Fish,
  Settings,
  BarChart,
  Droplets,
  Waves,
  FileUp,
  BrainCircuit,
  LayoutGrid
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";
import { useAuth } from "@/hooks/use-auth";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { role } = useAuth();
  const pathname = usePathname();
  
  const navLinks = [
    { href: "/dashboard", label: "Dashboard", description: "Overview & insights", icon: LayoutGrid, roles: ["CMLRE", "Researcher", "Student"] },
    { href: "/dashboard/submission", label: "Data Upload", description: "Import datasets", icon: FileUp, roles: ["Researcher", "Student"] },
    { href: "/dashboard/oceanography", label: "Oceanographic", description: "Water column data", icon: Droplets, roles: ["CMLRE", "Researcher", "Student"] },
    { href: "/dashboard/fisheries", label: "Fisheries", description: "Species & catch data", icon: Fish, roles: ["CMLRE", "Researcher", "Student"] },
    { href: "/dashboard/edna", label: "Molecular", description: "Genetic analysis", icon: Dna, roles: ["Researcher", "Student"] },
    { href: "/dashboard/analysis", label: "AI Analysis", description: "Smart insights", icon: BrainCircuit, roles: ["Researcher", "Student"] },
    {
      href: "/dashboard/approval",
      label: "Data Approval",
      icon: CheckCircle,
      badge: 2,
      roles: ["CMLRE"]
    },
  ];

  const quickActions = [
    { href: "#", label: "Global Search", icon: Search },
    { href: "#", label: "Settings", icon: Settings },
  ]
  
  const visibleNavLinks = navLinks.filter(link => role && link.roles.includes(role));

  const SidebarContentNav = () => (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
        <Link
          href="/dashboard"
          className="flex items-center gap-3 font-semibold"
        >
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Waves className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg">OceanAI</span>
            <span className="text-xs text-muted-foreground">Unified Data Platform</span>
          </div>
        </Link>
      </div>
      <div className="flex-1 overflow-y-auto">
        <nav className="grid items-start px-2 text-sm font-medium lg:px-4 mt-4">
          <p className="px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">Navigation</p>
          {visibleNavLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", {
                "bg-muted text-primary": pathname === link.href,
              })}
            >
              <link.icon className="h-4 w-4" />
              <div className="flex flex-col">
                <span>{link.label}</span>
                {link.description && <span className="text-xs text-muted-foreground">{link.description}</span>}
              </div>
              {link.badge && (
                <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                  {link.badge}
                </Badge>
              )}
            </Link>
          ))}
        </nav>
        <div className="px-2 lg:px-4 mt-8">
            <p className="px-3 py-2 text-xs text-muted-foreground uppercase tracking-wider">Quick Actions</p>
            {quickActions.map(action => (
                 <Link
                 key={action.label}
                 href={action.href}
                 className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
               >
                 <action.icon className="h-4 w-4" />
                 {action.label}
               </Link>
            ))}
        </div>
      </div>
      <div className="mt-auto p-4 border-t">
        <UserNav />
      </div>
    </div>
  )


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <SidebarContentNav />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6 md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 w-[280px]">
              <SidebarContentNav />
            </SheetContent>
          </Sheet>
           <div className="w-full flex-1 text-center">
             <Link
                href="/dashboard"
                className="flex items-center gap-2 font-semibold"
              >
                <FlaskConical className="h-6 w-6 text-primary" />
                <span>AquaInsight</span>
              </Link>
           </div>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/40">
          {children}
        </main>
      </div>
    </div>
  );
}
