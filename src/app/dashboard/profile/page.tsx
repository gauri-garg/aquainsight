
"use client";

import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/use-auth";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

export default function ProfilePage() {
  const { user, userDetails, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);

  const displayName = userDetails?.fullName || user?.email || "User";
  const fallback = displayName ? displayName.charAt(0).toUpperCase() : "U";

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Separator />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
            <Skeleton className="mt-2 h-4 w-48" />
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold md:text-2xl">Profile</h1>
        <p className="text-sm text-muted-foreground">
          View your account details here.
        </p>
      </div>
      <Separator />
      <Card>
        <CardHeader>
          <CardTitle>Your Information</CardTitle>
          <CardDescription>
            This is how your information appears on the platform.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="flex items-center space-x-6">
            <Avatar className="h-24 w-24">
              <AvatarImage
                src={user?.photoURL || "https://picsum.photos/seed/user-avatar/100/100"}
                alt={displayName}
                data-ai-hint="person face"
              />
              <AvatarFallback>{fallback}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-2xl font-bold">{displayName}</h2>
              <p className="text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="fullName">Full Name</Label>
            <Input id="fullName" value={displayName} readOnly />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ""} readOnly />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
               <Input id="password" type={showPassword ? "text" : "password"} value="password" readOnly />
               <Button variant="ghost" size="icon" className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7" onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <EyeOff /> : <Eye />}
                    <span className="sr-only">{showPassword ? 'Hide password' : 'Show password'}</span>
               </Button>
            </div>
             <div className="flex items-center gap-2">
               <p className="text-sm text-muted-foreground">Want to change your password?</p>
               <Button asChild variant="outline" size="sm">
                    <Link href="/dashboard/settings">Change Password</Link>
               </Button>
            </div>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
