"use client";

import { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Users, Shield, UserPlus } from "lucide-react";

interface UserData {
    id: string;
    name: string;
    email: string;
    role: string;
    createdAt: string;
}

export default function AdminOverviewPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUsers() {
            try {
                const res = await authClient.admin.listUsers({
                    query: { limit: 100 },
                });
                if (res.data) {
                    setUsers(
                        (res.data.users as any[]).map((u) => ({
                            id: u.id as string,
                            name: (u.name as string) || "",
                            email: u.email as string,
                            role: (u.role as string) || "user",
                            createdAt: u.createdAt as string,
                        }))
                    );
                }
            } catch (err) {
                console.error("Failed to fetch users:", err);
            } finally {
                setLoading(false);
            }
        }

        fetchUsers();
    }, []);

    const totalUsers = users.length;
    const adminUsers = users.filter((u) => u.role === "admin").length;
    const recentUsers = users.filter((u) => {
        const created = new Date(u.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return created >= weekAgo;
    }).length;

    const statCards = [
        {
            title: "Total Users",
            value: totalUsers,
            description: "All registered accounts",
            icon: Users,
        },
        {
            title: "Admins",
            value: adminUsers,
            description: "Admin and super admin roles",
            icon: Shield,
        },
        {
            title: "New This Week",
            value: recentUsers,
            description: "Registered in last 7 days",
            icon: UserPlus,
        },
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Overview</h1>
                <p className="text-muted-foreground mt-1">
                    Platform statistics and analytics
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {statCards.map((stat) => (
                    <Card key={stat.title}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                {stat.title}
                            </CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {loading ? (
                                    <div className="h-8 w-16 rounded bg-muted animate-pulse" />
                                ) : (
                                    stat.value
                                )}
                            </div>
                            <CardDescription className="text-xs mt-1">
                                {stat.description}
                            </CardDescription>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
}
