import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function OAuthClientsPage() {
  return (
    <div className="container max-w-3xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>OAuth Console Disabled</CardTitle>
          <CardDescription>
            This service is configured for external secure control only.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Manage OAuth applications through your external controller app via
          encrypted control APIs.
        </CardContent>
      </Card>
    </div>
  );
}
