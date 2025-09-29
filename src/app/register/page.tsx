
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FlaskConical, Loader2 } from "lucide-react";
import { useAuth, UserRole } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { database } from "@/lib/firebase";
import { ref, get } from "firebase/database";

export default function RegisterPage() {
  const { signUp } = useAuth();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<UserRole>("User");
  const [approvedId, setApprovedId] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  const { toast } = useToast();

  const handleRegister = async () => {
    setIsLoading(true);
    
    try {
      await signUp(email, password, selectedRole, { fullName, approvedId });
      toast({
        title: "Registration Successful",
        description: "Please login with your new account.",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Registration Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
              Create your account to get started.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Register</CardTitle>
              <CardDescription>
                Enter your information to create an account.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  onValueChange={(value: UserRole) => setSelectedRole(value)}
                  defaultValue={selectedRole}
                  disabled={isLoading}
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="User">User</SelectItem>
                    <SelectItem value="CMLRE">CMLRE Staff</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedRole !== "CMLRE" && (
                <div className="grid gap-2 animate-in fade-in-0 duration-300">
                  <Label htmlFor="fullname">Full Name</Label>
                  <Input
                    id="fullname"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

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

              {selectedRole === "CMLRE" && (
                <div className="grid gap-2 animate-in fade-in-0 duration-300">
                  <Label htmlFor="approved-id">Approved ID</Label>
                  <Input
                    id="approved-id"
                    placeholder="CMLRE-XYZ-123"
                    required
                    value={approvedId}
                    onChange={(e) => setApprovedId(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
              </div>

              <Button
                className="w-full mt-4"
                onClick={handleRegister}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  "Create an account"
                )}
              </Button>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/" className="underline text-primary">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="hidden bg-muted lg:block">
        <Image
          src="https://picsum.photos/seed/ocean-reg/1200/1800"
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
