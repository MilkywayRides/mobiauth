import Link from "next/link";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { PrismaClient } from "@prisma/client";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AVAILABLE_SCOPES, type Scope } from "@/lib/oauth";

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
    <div className="container max-w-2xl py-10">
      <Card>
        <CardHeader>
          <CardTitle>Authorize application</CardTitle>
          <CardDescription>
            Review the app details below before continuing.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="rounded-lg border p-4 space-y-2">
            <div className="text-lg font-semibold">{client.name}</div>
            {client.description && (
              <p className="text-sm text-muted-foreground">{client.description}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Publisher: {client.user.name || client.user.email}
            </p>
            {client.website && (
              <Link href={client.website} target="_blank" className="text-xs text-primary underline underline-offset-4">
                {client.website}
              </Link>
            )}
          </div>

          <div>
            <h3 className="font-medium mb-3">Requested permissions</h3>
            <div className="flex flex-wrap gap-2">
              {requestedScopes.map((scope) => (
                <Badge key={scope} variant="secondary">
                  {scope in AVAILABLE_SCOPES
                    ? AVAILABLE_SCOPES[scope as Scope]
                    : scope}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground rounded-md bg-muted p-3">
            You will be redirected to <span className="font-mono">{redirectUri}</span> after your choice.
          </div>
        </CardContent>

        <CardFooter className="flex items-center justify-end gap-2">
          <form method="POST" action="/api/oauth/authorize">
            <input type="hidden" name="client_id" value={clientId} />
            <input type="hidden" name="redirect_uri" value={redirectUri} />
            <input type="hidden" name="scope" value={requestedScopes.join(" ")} />
            {state ? <input type="hidden" name="state" value={state} /> : null}
            <Button variant="outline" name="action" value="deny" type="submit">
              Deny
            </Button>
          </form>
          <form method="POST" action="/api/oauth/authorize">
            <input type="hidden" name="client_id" value={clientId} />
            <input type="hidden" name="redirect_uri" value={redirectUri} />
            <input type="hidden" name="scope" value={requestedScopes.join(" ")} />
            {state ? <input type="hidden" name="state" value={state} /> : null}
            <Button name="action" value="allow" type="submit">
              Allow and continue
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
