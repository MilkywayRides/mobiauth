"use client";

import { useEffect, useState, useCallback } from "react";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Search,
    MoreHorizontal,
    Shield,
    Ban,
    CheckCircle,
    Eye,
    X,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    banned: boolean;
    emailVerified: boolean;
    createdAt: string;
    image?: string;
}

interface SessionData {
    id: string;
    token: string;
    userAgent?: string;
    ipAddress?: string;
    createdAt: string;
    expiresAt: string;
}

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [filteredUsers, setFilteredUsers] = useState<UserData[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(true);

    // Session dialog state
    const [sessionDialogOpen, setSessionDialogOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
    const [sessions, setSessions] = useState<SessionData[]>([]);
    const [sessionsLoading, setSessionsLoading] = useState(false);

    const fetchUsers = useCallback(async () => {
        try {
            const res = await authClient.admin.listUsers({
                query: { limit: 100 },
            });
            if (res.data) {
                const mapped = (res.data.users as any[]).map((u) => ({
                    id: u.id as string,
                    name: (u.name as string) || "",
                    email: u.email as string,
                    role: (u.role as string) || "user",
                    banned: !!(u.banned),
                    emailVerified: !!(u.emailVerified),
                    createdAt: u.createdAt as string,
                    image: u.image as string,
                }));
                setUsers(mapped);
                setFilteredUsers(mapped);
            }
        } catch (err) {
            console.error("Failed to fetch users:", err);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    useEffect(() => {
        if (!searchQuery) {
            setFilteredUsers(users);
            return;
        }
        const q = searchQuery.toLowerCase();
        setFilteredUsers(
            users.filter(
                (u) =>
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    u.role.toLowerCase().includes(q)
            )
        );
    }, [searchQuery, users]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await authClient.admin.setRole({
                userId,
                role: newRole as any,
            });
            toast.success(`Role updated to ${newRole}`);
            fetchUsers();
        } catch {
            toast.error("Failed to update role");
        }
    };

    const handleBanToggle = async (userId: string, isBanned: boolean) => {
        try {
            if (isBanned) {
                await authClient.admin.unbanUser({ userId });
                toast.success("User unbanned");
            } else {
                await authClient.admin.banUser({ userId });
                toast.success("User banned");
            }
            fetchUsers();
        } catch {
            toast.error("Failed to update ban status");
        }
    };

    const handleViewSessions = async (user: UserData) => {
        setSelectedUser(user);
        setSessionDialogOpen(true);
        setSessionsLoading(true);

        try {
            const res = await authClient.admin.listUserSessions({
                userId: user.id,
            } as any);
            if (res.data) {
                setSessions(
                    ((res.data as any).sessions || []).map((s: any) => ({
                        id: s.id as string,
                        token: (s.token as string) || "",
                        userAgent: s.userAgent as string,
                        ipAddress: s.ipAddress as string,
                        createdAt: s.createdAt as string,
                        expiresAt: s.expiresAt as string,
                    })) || []
                );
            }
        } catch {
            toast.error("Failed to load sessions");
        } finally {
            setSessionsLoading(false);
        }
    };

    const handleRevokeSession = async (sessionToken: string) => {
        try {
            await authClient.admin.revokeUserSession({ sessionToken });
            toast.success("Session revoked");
            if (selectedUser) handleViewSessions(selectedUser);
        } catch {
            toast.error("Failed to revoke session");
        }
    };

    const getRoleBadge = (role: string) => {
        switch (role) {
            case "admin":
                return <Badge variant="default">{role}</Badge>;
            default:
                return <Badge variant="secondary">{role}</Badge>;
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">User Management</h1>
                <p className="text-muted-foreground mt-1">
                    View and manage all registered users
                </p>
            </div>

            {/* Search */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                    />
                </div>
                <p className="text-sm text-muted-foreground">
                    {filteredUsers.length} user{filteredUsers.length !== 1 ? "s" : ""}
                </p>
            </div>

            {/* Users Table */}
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Joined</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center py-10">
                                        <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
                                    </TableCell>
                                </TableRow>
                            ) : filteredUsers.length === 0 ? (
                                <TableRow>
                                    <TableCell
                                        colSpan={5}
                                        className="text-center py-10 text-muted-foreground"
                                    >
                                        No users found
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredUsers.map((user) => (
                                    <TableRow key={user.id}>
                                        <TableCell>
                                            <div>
                                                <p className="font-medium">{user.name || "—"}</p>
                                                <p className="text-sm text-muted-foreground">
                                                    {user.email}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell>{getRoleBadge(user.role)}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                {user.banned ? (
                                                    <Badge variant="destructive">Banned</Badge>
                                                ) : (
                                                    <Badge variant="success">Active</Badge>
                                                )}
                                                {user.emailVerified && (
                                                    <Badge variant="outline">Verified</Badge>
                                                )}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm text-muted-foreground">
                                            {new Date(user.createdAt).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleViewSessions(user)}
                                                    >
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Sessions
                                                    </DropdownMenuItem>
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuLabel className="text-xs">
                                                        Change Role
                                                    </DropdownMenuLabel>
                                                    {["user", "admin"].map((role) => (
                                                        <DropdownMenuItem
                                                            key={role}
                                                            onClick={() => handleRoleChange(user.id, role)}
                                                            disabled={user.role === role}
                                                        >
                                                            <Shield className="mr-2 h-4 w-4" />
                                                            Set as {role}
                                                        </DropdownMenuItem>
                                                    ))}
                                                    <DropdownMenuSeparator />
                                                    <DropdownMenuItem
                                                        onClick={() => handleBanToggle(user.id, user.banned)}
                                                    >
                                                        {user.banned ? (
                                                            <>
                                                                <CheckCircle className="mr-2 h-4 w-4" />
                                                                Unban User
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Ban className="mr-2 h-4 w-4" />
                                                                Ban User
                                                            </>
                                                        )}
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Sessions Dialog */}
            <Dialog open={sessionDialogOpen} onOpenChange={setSessionDialogOpen}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle>
                            Sessions — {selectedUser?.name || selectedUser?.email}
                        </DialogTitle>
                        <DialogDescription>
                            Active sessions for this user
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-3 mt-4">
                        {sessionsLoading ? (
                            <div className="text-center py-8">
                                <Loader2 className="h-6 w-6 mx-auto animate-spin text-muted-foreground" />
                            </div>
                        ) : sessions.length === 0 ? (
                            <p className="text-center py-8 text-sm text-muted-foreground">
                                No active sessions
                            </p>
                        ) : (
                            sessions.map((session) => (
                                <Card key={session.id}>
                                    <CardHeader className="py-3 px-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <CardTitle className="text-sm font-mono">
                                                    {session.id}
                                                </CardTitle>
                                                <CardDescription className="text-xs">
                                                    {session.ipAddress || "Unknown IP"} •{" "}
                                                    Created{" "}
                                                    {new Date(session.createdAt).toLocaleString()}
                                                </CardDescription>
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() =>
                                                    handleRevokeSession(session.token)
                                                }
                                                className="gap-1.5"
                                            >
                                                <X className="h-3 w-3" />
                                                Revoke
                                            </Button>
                                        </div>
                                    </CardHeader>
                                </Card>
                            ))
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
