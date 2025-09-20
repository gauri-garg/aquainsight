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
    { href: "/dashboard", label: "Dashboard", icon: Home, roles: ["CMLRE", "Researcher", "Student"] },
    { href: "/dashboard/submission", label: "Data Submission", icon: Upload, roles: ["Researcher", "Student"] },
    { href: "/dashboard/edna", label: "eDNA Matching", icon: Dna, roles: ["Researcher", "Student"] },
    {
      href: "/dashboard/approval",
      label: "Data Approval",
      icon: CheckCircle,
      badge: 2,
      roles: ["CMLRE"]
    },
    { href: "/dashboard/oceanography", label: "Physical Oceanography", icon: Wind, roles: ["CMLRE", "Researcher", "Student"] },
    { href: "/dashboard/chemical-oceanography", label: "Chemical Oceanography", icon: Beaker, roles: ["CMLRE", "Researcher", "Student"] },
    { href: "/dashboard/ocean-atmosphere", label: "Ocean Atmosphere", icon: Thermometer, roles: ["CMLRE", "Researcher", "Student"] },
    { href: "/dashboard/analysis", label: "Analysis", icon: LineChart, roles: ["Researcher", "Student"] },
    { href: "/dashboard/user", label: "User", icon: Users, roles: ["CMLRE", "Researcher", "Student"] }
  ];
  
  const visibleNavLinks = navLinks.filter(link => role && link.roles.includes(role));

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 font-semibold"
            >
              <FlaskConical className="h-6 w-6 text-primary" />
              <span>AquaInsight</span>
            </Link>
            <Button variant="outline" size="icon" className="ml-auto h-8 w-8">
              <Bell className="h-4 w-4" />
              <span className="sr-only">Toggle notifications</span>
            </Button>
          </div>
          <div className="flex-1">
            <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
              {visibleNavLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn("flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary", {
                    "bg-muted text-primary": pathname === link.href,
                  })}
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                  {link.badge && (
                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                      {link.badge}
                    </Badge>
                  )}
                </Link>
              ))}
            </nav>
          </div>
          <div className="mt-auto p-4">
            <Card>
              <CardHeader className="p-2 pt-0 md:p-4">
                <CardTitle>Need Help?</CardTitle>
                <CardDescription>
                  Our documentation has you covered.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-2 pt-0 md:p-4 md:pt-0">
                <Button size="sm" className="w-full">
                  Read Docs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
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
                  <span>AquaInsight</span>
                </Link>
                {visibleNavLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn("mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground",{
                      "bg-muted text-foreground": pathname === link.href,
                    })}
                  >
                    <link.icon className="h-5 w-5" />
                    {link.label}
                    {link.badge && (
                      <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                        {link.badge}
                      </Badge>
                    )}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto">
                <Card>
                  <CardHeader>
                    <CardTitle>Need Help?</CardTitle>
                    <CardDescription>
                      Our documentation has you covered.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button size="sm" className="w-full">
                      Read Docs
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search datasets, species..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <UserNav />
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 bg-muted/30">
          {children}
        </main>
      </div>
    </div>
  );
}

    
