import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12">
        <div className="mx-auto grid w-[380px] gap-6">
          <div className="grid gap-2 text-center">
            <div className="flex justify-center items-center gap-2">
              <FlaskConical className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">AquaInsight</h1>
            </div>
            <p className="text-balance text-muted-foreground">
              Unifying oceanographic, fisheries, and molecular biology datasets.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Login</CardTitle>
              <CardDescription>
                Enter your email below to login to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  defaultValue="cmlre.user@example.com"
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="ml-auto inline-block text-sm underline"
                  >
                    Forgot your password?
                  </Link>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  defaultValue="password"
                />
              </div>
              <Link href="/dashboard" className="w-full">
                <Button className="w-full">Login</Button>
              </Link>
               <p className="text-center text-sm text-muted-foreground">Or sign in as a demo user:</p>
               <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                 <Link href="/dashboard">
                   <Button variant="outline" className="w-full">CMLRE</Button>
                 </Link>
                 <Link href="/dashboard">
                   <Button variant="outline" className="w-full">Researcher</Button>
                 </Link>
                 <Link href="/dashboard">
                   <Button variant="outline" className="w-full">Student</Button>
                 </Link>
               </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/ocean/1200/1800"
          alt="Ocean"
          data-ai-hint="ocean water"
          width="1200"
          height="1800"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>
    </div>
  );
}
