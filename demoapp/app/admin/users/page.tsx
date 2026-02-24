"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface User {
  id: string;
  name: string | null;
  email: string;
  emailVerified: boolean;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (session?.accessToken) {
      fetch(`${process.env.NEXT_PUBLIC_AUTH_URL}/api/admin/users`, {
        headers: {
          Authorization: `Bearer ${session.accessToken}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            setError(data.error);
          } else {
            setUsers(data.users);
          }
          setLoading(false);
        })
        .catch(() => {
          setError("Failed to fetch users");
          setLoading(false);
        });
    }
  }, [session]);

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 bg-gray-200 rounded" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-10">
        <div className="bg-white rounded-lg border p-6">
          <h2 className="text-xl font-bold mb-2">Access Denied</h2>
          <p className="text-gray-600">
            {error === "insufficient_scope"
              ? "You don't have permission to view this page"
              : "Failed to load users"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-gray-600">Manage all users from the auth server</p>
      </div>

      <div className="bg-white rounded-lg border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">All Users ({users.length})</h2>
          <p className="text-gray-600">Users registered on the authentication server</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {users.map((user) => (
              <div key={user.id} className="flex items-center gap-4 p-4 rounded-lg border">
                <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-blue-600">
                    {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1">
                  <p className="font-medium">{user.name || "No name"}</p>
                  <p className="text-sm text-gray-600">{user.email}</p>
                </div>
                <div className="flex gap-2">
                  <span className={`px-2 py-1 text-xs rounded ${user.role === "admin" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>
                    {user.role}
                  </span>
                  {user.emailVerified && (
                    <span className="px-2 py-1 text-xs rounded border">Verified</span>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
