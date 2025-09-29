
"use client";

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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FlaskConical, Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function LoginPage() {
  const { signIn, sendPasswordReset } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState("cmlre.user@example.com");
  const [password, setPassword] = useState("password");
  const [isLoading, setIsLoading] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [isResetting, setIsResetting] = useState(false);
  const [openAlertDialog, setOpenAlertDialog] = useState(false);

  const handleLogin = async () => {
    setIsLoading(true);
    try {
      await signIn(email, password);
      router.push("/dashboard");
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ title: "Email required", description: "Please enter your email address.", variant: "destructive" });
      return;
    }
    setIsResetting(true);
    try {
      await sendPasswordReset(resetEmail);
      toast({
        title: "Password Reset Email Sent",
        description: `If an account exists for ${resetEmail}, a password reset link has been sent.`,
      });
      setOpenAlertDialog(false);
    } catch (error: any) {
      toast({
        title: "Reset Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsResetting(false);
    }
  };


  return (
    <div className="w-full lg:grid lg:min-h-screen lg:grid-cols-2">
      <div className="flex items-center justify-center py-12 animate-in fade-in-50 duration-500">
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                   <AlertDialog open={openAlertDialog} onOpenChange={setOpenAlertDialog}>
                    <AlertDialogTrigger asChild>
                       <Button variant="link" className="ml-auto inline-block p-0 h-auto text-sm underline">
                          Forgot your password?
                       </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Forgot Password?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Enter your email address and we will send you a link to reset your password.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                       <div className="grid gap-2">
                          <Label htmlFor="reset-email">Email Address</Label>
                          <Input
                            id="reset-email"
                            type="email"
                            placeholder="m@example.com"
                            value={resetEmail}
                            onChange={(e) => setResetEmail(e.target.value)}
                            disabled={isResetting}
                          />
                        </div>
                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isResetting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handlePasswordReset} disabled={isResetting}>
                          {isResetting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Send Reset Link
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <Button className="w-full" onClick={handleLogin} disabled={isLoading}>
                 {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
               <div className="mt-4 text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/register" className="underline">
                  Sign up
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
