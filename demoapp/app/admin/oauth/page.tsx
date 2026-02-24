'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { getOAuthClients, createOAuthClient, deleteOAuthClient } from '@/lib/auth-api';

export default function OAuthAdmin() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', redirectUri: '' });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin');
    } else if (session?.accessToken) {
      loadClients();
    }
  }, [status, session, router]);

  const loadClients = async () => {
    try {
      const response = await getOAuthClients(session!.accessToken!);
      setClients(response.data);
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createOAuthClient(session!.accessToken!, formData);
      setShowForm(false);
      setFormData({ name: '', redirectUri: '' });
      loadClients();
    } catch (error) {
      console.error('Failed to create client:', error);
    }
  };

  const handleDelete = async (clientId: string) => {
    if (!confirm('Delete this OAuth client?')) return;
    try {
      await deleteOAuthClient(session!.accessToken!, clientId);
      loadClients();
    } catch (error) {
      console.error('Failed to delete client:', error);
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">OAuth Clients</h1>
          <div className="space-x-4">
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              {showForm ? 'Cancel' : 'New Client'}
            </button>
            <a href="/dashboard" className="text-blue-600 hover:underline">← Back</a>
          </div>
        </div>

        {showForm && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Redirect URI</label>
                <input
                  type="url"
                  value={formData.redirectUri}
                  onChange={(e) => setFormData({ ...formData, redirectUri: e.target.value })}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
                Create Client
              </button>
            </form>
          </div>
        )}

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client ID</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Redirect URI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {clients.map((client) => (
                <tr key={client.id}>
                  <td className="px-6 py-4 whitespace-nowrap">{client.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm">{client.clientId}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{client.redirectUri}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => handleDelete(client.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
