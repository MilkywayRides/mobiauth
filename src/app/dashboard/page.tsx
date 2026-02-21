"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Shield,
    LogOut,
    Settings,
    User,
    Clock,
    Mail,
    ChevronDown,
    LayoutDashboard,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
    const { data: session, isPending } = useSession();
    const router = useRouter();

    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-pulse flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-muted" />
                    <div className="h-4 w-32 rounded bg-muted" />
                </div>
            </div>
        );
    }

    const user = session?.user;
    const userRole = (user as Record<string, unknown>)?.role as string || "user";
    const isAdmin = userRole === "admin";

    const handleSignOut = async () => {
        await signOut();
        router.push("/auth/login");
        router.refresh();
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b sticky top-0 z-50 bg-background">
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="text-lg font-bold">AuthPlatform</span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-1">
                            <Link href="/dashboard">
                                <Button variant="ghost" size="sm" className="gap-2">
                                    <LayoutDashboard className="h-4 w-4" />
                                    Dashboard
                                </Button>
                            </Link>
                            {isAdmin && (
                                <Link href="/admin">
                                    <Button variant="ghost" size="sm" className="gap-2">
                                        <Settings className="h-4 w-4" />
                                        Admin
                                    </Button>
                                </Link>
                            )}
                        </nav>
                    </div>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="gap-2 px-2">
                                <Avatar className="h-7 w-7">
                                    <AvatarImage src={user?.image || ""} />
                                    <AvatarFallback className="text-xs">
                                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <span className="hidden md:inline text-sm">
                                    {user?.name || "User"}
                                </span>
                                <ChevronDown className="h-3 w-3 text-muted-foreground" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuLabel>
                                <div className="flex flex-col gap-1">
                                    <span className="font-medium">{user?.name}</span>
                                    <span className="text-xs text-muted-foreground font-normal">
                                        {user?.email}
                                    </span>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            {isAdmin && (
                                <DropdownMenuItem onClick={() => router.push("/admin")}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Admin Panel
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={handleSignOut}>
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold">Dashboard</h1>
                    <p className="text-muted-foreground mt-1">
                        Welcome back, {user?.name}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card className="md:col-span-2">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <User className="h-5 w-5" />
                                Profile
                            </CardTitle>
                            <CardDescription>Your account information</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-start gap-4">
                                <Avatar className="h-16 w-16">
                                    <AvatarImage src={user?.image || ""} />
                                    <AvatarFallback className="text-xl">
                                        {user?.name?.charAt(0)?.toUpperCase() || "U"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="space-y-3 flex-1">
                                    <div>
                                        <p className="text-lg font-semibold">{user?.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                            <p className="text-sm text-muted-foreground">
                                                {user?.email}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Badge
                                            variant={
                                                userRole === "admin"
                                                    ? "default"
                                                    : "secondary"
                                            }
                                        >
                                            {userRole}
                                        </Badge>
                                        {user?.emailVerified && (
                                            <Badge variant="success">Verified</Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Session Info */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Clock className="h-5 w-5" />
                                Session
                            </CardTitle>
                            <CardDescription>Current session details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div>
                                <p className="text-xs text-muted-foreground">Status</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="h-2 w-2 rounded-full bg-green-500" />
                                    <span className="text-sm">Active</span>
                                </div>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground">Session ID</p>
                                <p className="text-sm font-mono text-muted-foreground truncate">
                                    {session?.session?.id || "—"}
                                </p>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="w-full mt-4"
                                onClick={handleSignOut}
                            >
                                <LogOut className="mr-2 h-3 w-3" />
                                Sign out
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
