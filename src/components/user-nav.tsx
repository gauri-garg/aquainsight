
"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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
import { useAuth, Notification } from "@/hooks/use-auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, Loader2, PackageX, CircleCheck, CircleX, FilePlus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "./ui/badge";

export function UserNav() {
  const { user, role, userDetails, logout, deleteUserAccount, getUserNotifications, markNotificationsAsRead, deleteNotification } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [popoverOpen, setPopoverOpen] = useState(false);

  useEffect(() => {
    if (user) {
      const unsubscribe = getUserNotifications(user.uid, (newNotifications) => {
        setNotifications(newNotifications);
        setUnreadCount(newNotifications.filter(n => !n.read).length);
      });
      return () => unsubscribe();
    }
  }, [user, getUserNotifications]);
  
  const handlePopoverOpen = (open: boolean) => {
    setPopoverOpen(open);
    if (!open && unreadCount > 0) {
      markNotificationsAsRead();
    }
  };

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
  const roleDescription = role === "CMLRE" ? "Staff" : "User";
  const fallback = displayName ? displayName.charAt(0).toUpperCase() : "U";
  
  const NotificationIcon = ({status}: {status: Notification['status']}) => {
    if (status === 'approved') {
        return (
            <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-full">
                <CircleCheck className="h-5 w-5 text-green-500" />
            </div>
        )
    }
    if (status === 'rejected') {
        return (
            <div className="bg-red-100 dark:bg-red-900/50 p-2 rounded-full">
                <CircleX className="h-5 w-5 text-red-500" />
            </div>
        )
    }
    return (
       <div className="bg-blue-100 dark:bg-blue-900/50 p-2 rounded-full">
            <FilePlus className="h-5 w-5 text-blue-500" />
        </div>
    )
  }

  return (
    <>
      <div className="flex items-center gap-2">
         <Popover open={popoverOpen} onOpenChange={handlePopoverOpen}>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                 <Badge
                    variant="destructive"
                    className="absolute top-0 right-0 h-5 w-5 justify-center rounded-full p-0 text-xs"
                >
                    {unreadCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="end">
            <div className="p-4 pt-2">
              <h4 className="font-medium leading-none">Notifications</h4>
              <p className="text-sm text-muted-foreground">
                Recent updates and alerts.
              </p>
            </div>
            <div className="p-2">
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <div key={notif.id} className="group relative flex items-start gap-3 p-2 rounded-lg">
                    <NotificationIcon status={notif.status} />
                    <div className="flex-1">
                      <p className="text-sm font-medium capitalize">{notif.message}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        &quot;{notif.datasetName}&quot;
                      </p>
                      <p className="text-xs text-muted-foreground">
                         {new Date(notif.date).toLocaleString()}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center text-sm text-muted-foreground p-4">
                  You have no new notifications.
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
              <div className="flex items-center gap-3 cursor-pointer">
                   <Avatar className="h-9 w-9">
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
