"use client";

import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { User } from "lucide-react";

export default function UserPage() {
  const { role } = useAuth();

  return (
    <Card className="flex flex-col items-center justify-center text-center p-8 min-h-[400px]">
      <CardHeader>
        <div className="mx-auto bg-muted rounded-full p-4">
          <User className="h-12 w-12 text-muted-foreground" />
        </div>
        <CardTitle className="mt-4">User Profile</CardTitle>
        <CardDescription>
          Welcome, you are logged in as a {role}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground max-w-md">
          This is your user page. Content here can be tailored based on your role.
        </p>
      </CardContent>
    </Card>
  );
}
