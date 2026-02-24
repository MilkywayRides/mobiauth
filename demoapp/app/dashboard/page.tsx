'use client';

import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    }
  }, [status, router]);

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <button
            onClick={() => signOut()}
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Sign Out
          </button>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">User Info</h2>
          <p><strong>Email:</strong> {session?.user?.email}</p>
          <p><strong>Name:</strong> {session?.user?.name}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <a href="/admin/users" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">User Management</h3>
            <p className="text-gray-600">Manage users and permissions</p>
          </a>
          
          <a href="/admin/oauth" className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition">
            <h3 className="text-xl font-semibold mb-2">OAuth Clients</h3>
            <p className="text-gray-600">Manage OAuth applications</p>
          </a>
        </div>
      </div>
    </div>
  );
}
