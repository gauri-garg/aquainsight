
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";

export function UserNav() {
  const { user, role, userDetails, logout, deleteUserAccount } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLogout = async () => {
    await logout();
    router.push("/");
  };
  
  const handleDeleteAccount = async () => {
    if (!user?.email) {
      toast({
        title: "Error",
        description: "Could not find user email for deletion.",
        variant: "destructive",
      });
      return;
    }
    setIsDeleting(true);
    try {
      await deleteUserAccount(user.email, password);
      toast({
        title: "Account Deleted",
        description: "Your account has been permanently deleted.",
      });
      setShowDeleteDialog(false);
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setPassword("");
    }
  };

  const displayName = userDetails?.fullName || user?.email || "User";
  const roleDescription = role === "CMLRE" ? "Staff" : role === "Researcher" ? "Researcher" : "Student";
  const fallback = displayName ? displayName.charAt(0).toUpperCase() : "U";
  const photoURL = userDetails?.photoURL || user?.photoURL;


  return (
    <>
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
                      src={photoURL || undefined}
                      alt={displayName}
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
             <DropdownMenuItem
              onSelect={() => setShowDeleteDialog(true)}
              className="text-red-500 focus:text-red-500 focus:bg-red-50"
            >
              Delete Account
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              account and remove your data from our servers. To confirm,
              please enter your password.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="grid gap-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isDeleting}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={!password || isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Account"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
