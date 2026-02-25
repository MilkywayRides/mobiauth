"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Copy, Eye, EyeOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface OAuthClient {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  website: string | null;
  redirectUris: string[];
  scopes: string[];
  active: boolean;
  createdAt: string;
}

export default function OAuthClientsPage() {
  const [clients, setClients] = useState<OAuthClient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    website: "",
    description: "",
    redirectUri: "",
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const res = await fetch("/api/oauth/clients");
    const data = await res.json();
    setClients(data.clients || []);
    setLoading(false);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const res = await fetch("/api/oauth/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.name,
        website: formData.website,
        description: formData.description,
        redirectUris: [formData.redirectUri],
      }),
    });

    const data = await res.json();
    
    if (data.error) {
      toast.error(data.error);
    } else {
      toast.success("OAuth client created!");
      setShowForm(false);
      setFormData({ name: "", website: "", description: "", redirectUri: "" });
      fetchClients();
      
      // Show credentials
      alert(`Client ID: ${data.clientId}\nClient Secret: ${data.clientSecret}\n\nSave these credentials securely!`);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this OAuth client?")) return;
    
    await fetch(`/api/oauth/clients/${id}`, { method: "DELETE" });
    toast.success("Client deleted");
    fetchClients();
  };

  if (loading) {
    return <div className="container py-10">Loading...</div>;
  }

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">OAuth Applications</h1>
          <p className="text-muted-foreground">Manage OAuth 2.0 clients</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          New Application
        </Button>
      </div>

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create OAuth Application</CardTitle>
            <CardDescription>Register a new OAuth 2.0 client</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <Label>Application name *</Label>
                <Input
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="My Application"
                />
              </div>
              <div>
                <Label>Homepage URL *</Label>
                <Input
                  required
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://example.com"
                />
              </div>
              <div>
                <Label>Application description</Label>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="What does your application do?"
                />
              </div>
              <div>
                <Label>Authorization callback URL *</Label>
                <Input
                  required
                  type="url"
                  value={formData.redirectUri}
                  onChange={(e) => setFormData({ ...formData, redirectUri: e.target.value })}
                  placeholder="https://example.com/api/auth/callback"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">Create Application</Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {clients.map((client) => (
          <Card key={client.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{client.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {client.description || "No description"}
                  </CardDescription>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDelete(client.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs">Client ID</Label>
                <div className="flex gap-2 mt-1">
                  <Input value={client.clientId} readOnly className="font-mono text-sm" />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard.writeText(client.clientId);
                      toast.success("Copied!");
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div>
                <Label className="text-xs">Homepage</Label>
                <p className="text-sm text-muted-foreground">{client.website}</p>
              </div>
              <div>
                <Label className="text-xs">Callback URLs</Label>
                <div className="space-y-1">
                  {client.redirectUris.map((uri, i) => (
                    <p key={i} className="text-sm font-mono text-muted-foreground">{uri}</p>
                  ))}
                </div>
              </div>
              <div>
                <Label className="text-xs">Scopes</Label>
                <div className="flex flex-wrap gap-1 mt-1">
                  {client.scopes.map((scope) => (
                    <Badge key={scope} variant="secondary">{scope}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
