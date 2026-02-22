"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Eye, EyeOff } from "lucide-react";

export default function ApiKeysPage() {
  const [keys, setKeys] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newKey, setNewKey] = useState<any>(null);

  useEffect(() => {
    fetchKeys();
  }, []);

  const fetchKeys = async () => {
    const res = await fetch("/api/keys");
    const data = await res.json();
    setKeys(data.keys || []);
  };

  const createKey = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: formData.get("name"),
        scopes: ["read:user"],
        rateLimit: parseInt(formData.get("rateLimit") as string) || 1000,
      }),
    });
    const data = await res.json();
    setNewKey(data.apiKey);
    setShowForm(false);
    fetchKeys();
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">API Keys</h1>
        <Button onClick={() => setShowForm(!showForm)}>Create New Key</Button>
      </div>

      {newKey && (
        <Card className="mb-6 border-green-500">
          <CardHeader>
            <CardTitle>API Key Created!</CardTitle>
            <CardDescription>Save this key now. You won't see it again.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex gap-2">
              <Input value={newKey.key} readOnly className="font-mono" />
              <Button size="icon" variant="outline" onClick={() => navigator.clipboard.writeText(newKey.key)}>
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <Button onClick={() => setNewKey(null)}>Done</Button>
          </CardContent>
        </Card>
      )}

      {showForm && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Create API Key</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={createKey} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Key Name</label>
                <Input name="name" required placeholder="Production API Key" />
              </div>
              <div>
                <label className="text-sm font-medium">Rate Limit (requests/hour)</label>
                <Input name="rateLimit" type="number" defaultValue={1000} />
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
        {keys.map((key) => (
          <Card key={key.id}>
            <CardHeader>
              <CardTitle>{key.name}</CardTitle>
              <CardDescription>Created {new Date(key.createdAt).toLocaleDateString()}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div><strong>Key:</strong> <code className="font-mono">{key.key}</code></div>
                <div><strong>Rate Limit:</strong> {key.rateLimit}/hour</div>
                <div><strong>Last Used:</strong> {key.lastUsedAt ? new Date(key.lastUsedAt).toLocaleString() : "Never"}</div>
                <div><strong>Status:</strong> {key.active ? "Active" : "Inactive"}</div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
