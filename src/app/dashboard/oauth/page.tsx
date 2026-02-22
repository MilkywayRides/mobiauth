"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Eye, EyeOff, Trash2 } from "lucide-react";

export default function OAuthClientsPage() {
  const [clients, setClients] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newClient, setNewClient] = useState<any>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const res = await fetch("/api/oauth/clients");
    const data = await res.json();
    setClients(data.clients || []);
  };

  const createClient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/oauth/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        description: formData.get("description"),
        website: formData.get("website"),
        redirectUris: (formData.get("redirectUris") as string).split("\n").filter(Boolean),
        scopes: ["profile", "email"],
      }),
    });
    const data = await res.json();
    setNewClient(data.client);
    setShowForm(false);
    fetchClients();
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">OAuth Applications</h1>
        <Button onClick={() => setShowForm(!showForm)}>Create New App</Button>
      </div>

      {newClient && (
        <Card className="mb-6 border-green-500">
          <CardHeader>
            <CardTitle>Application Created!</CardTitle>
            <CardDescription>Save these credentials now. You won't see them again.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div>
              <label className="text-sm font-medium">Client ID</label>
              <div className="flex gap-2">
                <Input value={newClient.clientId} readOnly />
                <Button size="icon" variant="outline" onClick={() => navigator.clipboard.writeText(newClient.clientId)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Client Secret</label>
              <div className="flex gap-2">
                <Input value={newClient.clientSecret} readOnly />
                <Button size="icon" variant="outline" onClick={() => navigator.clipboard.writeText(newClient.clientSecret)}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <Button onClick={() => setNewClient(null)}>Done</Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create OAuth Application</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createClient} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Application Name</label>
                <Input name="name" required />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input name="description" />
              </div>
              <div>
                <label className="text-sm font-medium">Website</label>
                <Input name="website" type="url" />
              </div>
              <div>
                <label className="text-sm font-medium">Redirect URIs (one per line)</label>
                <textarea name="redirectUris" className="w-full border rounded p-2" rows={3} required />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <CardTitle>{client.name}</CardTitle>
              <CardDescription>{client.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Client ID:</strong> {client.clientId}</div>
                <div><strong>Redirect URIs:</strong> {client.redirectUris.join(", ")}</div>
                <div><strong>Scopes:</strong> {client.scopes.join(", ")}</div>
                <div><strong>Status:</strong> {client.active ? "Active" : "Inactive"}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
