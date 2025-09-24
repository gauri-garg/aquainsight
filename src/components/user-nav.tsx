
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell } from "lucide-react";

export function UserNav() {
  const { user, role, userDetails, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };
  
  const displayName = userDetails?.fullName || user?.email || "User";
  const roleDescription = role === "CMLRE" ? "Staff" : role === "Researcher" ? "Researcher" : "Student";
  const fallback = displayName ? displayName.charAt(0).toUpperCase() : "U";


  return (
    <div className="flex items-center gap-2">
       <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notifications</span>
        </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
            <div className="flex items-center gap-3 cursor-pointer">
                 <Avatar className="h-9 w-9">
                    <AvatarImage
                    src={user?.photoURL || "https://picsum.photos/seed/user-avatar/100/100"}
                    alt={displayName}
                    data-ai-hint="person face"
                    />
                    <AvatarFallback>{fallback}</AvatarFallback>
                </Avatar>
                <div className="hidden md:flex flex-col items-start">
                    <p className="text-sm font-medium leading-none">{displayName}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                    {roleDescription}
                    </p>
                </div>
            </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{displayName}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile">Profile</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/dashboard/settings">Settings</Link>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
