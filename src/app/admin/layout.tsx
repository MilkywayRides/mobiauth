"use client";

import { useSession, signOut } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
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
    LayoutDashboard,
    Users,
    ChevronDown,
    BarChart3,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const sidebarLinks = [
    { href: "/admin", label: "Overview", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
];

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { data: session, isPending } = useSession();
    const pathname = usePathname();
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

    const handleSignOut = async () => {
        await signOut();
        router.push("/auth/login");
        router.refresh();
    };

    return (
        <div className="min-h-screen">
            {/* Header */}
            <header className="border-b sticky top-0 z-50 bg-background">
                <div className="px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Link href="/" className="flex items-center gap-2">
                            <Shield className="h-5 w-5" />
                            <span className="text-lg font-bold">AuthPlatform</span>
                        </Link>
                        <span className="text-xs text-muted-foreground border rounded-md px-2 py-0.5 uppercase tracking-wider">
                            Admin
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <Link href="/dashboard">
                            <Button variant="ghost" size="sm" className="gap-2">
                                <LayoutDashboard className="h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="gap-2 px-2">
                                    <Avatar className="h-7 w-7">
                                        <AvatarImage src={user?.image || ""} />
                                        <AvatarFallback className="text-xs">
                                            {user?.name?.charAt(0)?.toUpperCase() || "A"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <span className="hidden md:inline text-sm">
                                        {user?.name || "Admin"}
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
                                <DropdownMenuItem onClick={handleSignOut}>
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            <div className="flex">
                {/* Sidebar */}
                <aside className="w-64 min-h-[calc(100vh-57px)] border-r p-4 hidden md:block">
                    <nav className="space-y-1">
                        {sidebarLinks.map((link) => {
                            const isActive = pathname === link.href;
                            return (
                                <Link key={link.href} href={link.href}>
                                    <Button
                                        variant={isActive ? "secondary" : "ghost"}
                                        className="w-full justify-start gap-2"
                                    >
                                        <link.icon className="h-4 w-4" />
                                        {link.label}
                                    </Button>
                                </Link>
                            );
                        })}
                    </nav>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-6">{children}</main>
            </div>
        </div>
    );
}
