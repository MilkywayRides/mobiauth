import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function ApiKeysPage() {
  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>API Key Console Disabled</CardTitle>
          <CardDescription>
            This service is configured for external secure control only.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Manage API keys from your external controller app using encrypted
          control endpoints.
        </CardContent>
      </Card>
    </div>
  );
}
