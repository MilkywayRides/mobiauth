import { Shield } from "lucide-react";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AVAILABLE_SCOPES, type Scope } from "@/lib/oauth";
import Link from "next/link";

const prisma = new PrismaClient();

interface ConsentPageProps {
  searchParams: Promise<{
    client_id?: string;
    redirect_uri?: string;
    scope?: string;
    state?: string;
  }>;
}

export default async function OAuthConsentPage({ searchParams }: ConsentPageProps) {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  
  if (!session?.user) {
    redirect("/auth/login");
  }

  const params = await searchParams;
  const clientId = params.client_id;
  const redirectUri = params.redirect_uri;
  const state = params.state;
  const requestedScopes = (params.scope || "profile email").split(" ").filter(Boolean);

  if (!clientId || !redirectUri) {
    return <div className="container py-10">Invalid authorization request.</div>;
  }

  const client = await prisma.oAuthClient.findUnique({
    where: { clientId },
    select: {
      clientId: true,
      name: true,
      description: true,
      website: true,
      logo: true,
      scopes: true,
      active: true,
      user: { select: { name: true, email: true } },
    },
  });

  if (!client || !client.active || !client.scopes.every((s) => typeof s === "string")) {
    return <div className="container py-10">Unknown or inactive application.</div>;
  }

  const invalidScopes = requestedScopes.filter((scope) => !client.scopes.includes(scope));
  if (invalidScopes.length > 0) {
    return <div className="container py-10">This app requested invalid permissions.</div>;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center justify-center mb-4">
            {client.logo ? (
              <img src={client.logo} alt={client.name} className="h-16 w-16 rounded-lg" />
            ) : (
              <div className="h-16 w-16 rounded-lg bg-primary/10 flex items-center justify-center">
                <Shield className="h-8 w-8 text-primary" />
              </div>
            )}
          </div>
          <CardTitle className="text-2xl text-center">Authorize {client.name}</CardTitle>
          <CardDescription className="text-center">
            {client.name} is requesting access to your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5 border">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {session.user.name?.charAt(0).toUpperCase() || session.user.email?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name || "Your Account"}</p>
              <p className="text-xs text-muted-foreground truncate">{session.user.email}</p>
            </div>
          </div>

          {client.description && (
            <p className="text-sm text-muted-foreground text-center">{client.description}</p>
          )}

          <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
            <p className="text-sm font-medium">This application will be able to:</p>
            <div className="space-y-2">
              {requestedScopes.map((scope) => (
                <div key={scope} className="flex items-start gap-2">
                  <Badge variant="outline" className="mt-0.5">
                    {scope}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {scope in AVAILABLE_SCOPES ? AVAILABLE_SCOPES[scope as Scope] : scope}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-muted/50 p-3 space-y-1">
            <p className="text-xs font-medium">Publisher</p>
            <p className="text-xs text-muted-foreground">{client.user.name || client.user.email}</p>
            {client.website && (
              <Link href={client.website} target="_blank" className="text-xs text-primary hover:underline inline-flex items-center gap-1">
                Visit website →
              </Link>
            )}
          </div>

          <p className="text-xs text-center text-muted-foreground">
            You'll be redirected to <span className="font-mono">{new URL(redirectUri).hostname}</span>
          </p>
        </CardContent>

        <CardFooter className="flex gap-3">
          <form method="POST" action="/api/oauth/authorize" className="flex-1">
            <input type="hidden" name="client_id" value={clientId} />
            <input type="hidden" name="redirect_uri" value={redirectUri} />
            <input type="hidden" name="scope" value={requestedScopes.join(" ")} />
            {state ? <input type="hidden" name="state" value={state} /> : null}
            <Button variant="outline" name="action" value="deny" type="submit" className="w-full">
              Cancel
            </Button>
          </form>
          <form method="POST" action="/api/oauth/authorize" className="flex-1">
            <input type="hidden" name="client_id" value={clientId} />
            <input type="hidden" name="redirect_uri" value={redirectUri} />
            <input type="hidden" name="scope" value={requestedScopes.join(" ")} />
            {state ? <input type="hidden" name="state" value={state} /> : null}
            <Button name="action" value="allow" type="submit" className="w-full">
              Authorize
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
