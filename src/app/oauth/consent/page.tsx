"use client"

import { useSearchParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Check } from "lucide-react"
import { useState } from "react"

export default function ConsentPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  const clientId = searchParams.get("client_id")
  const redirectUri = searchParams.get("redirect_uri")
  const state = searchParams.get("state") || ""
  const scope = searchParams.get("scope") || "profile email"
  const appName = searchParams.get("app_name") || "Application"

  const scopes = scope.split(" ")

  const handleAllow = async () => {
    setLoading(true)
    
    // Generate authorization code
    const code = Math.random().toString(36).substring(2, 15)
    
    // Store consent
    document.cookie = `oauth-consent-${clientId}=granted; path=/; max-age=31536000`
    
    // Redirect back with code
    const callback = new URL(redirectUri!)
    callback.searchParams.set("code", code)
    callback.searchParams.set("state", state)
    
    window.location.href = callback.toString()
  }

  const handleDeny = () => {
    const callback = new URL(redirectUri!)
    callback.searchParams.set("error", "access_denied")
    callback.searchParams.set("state", state)
    window.location.href = callback.toString()
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Authorization Request</CardTitle>
          <CardDescription>
            <strong>{appName}</strong> wants to access your BlazeNeuro account
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-3">
            <p className="text-sm font-medium">This will allow <strong>{appName}</strong> to:</p>
            <ul className="space-y-2">
              {scopes.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-green-600" />
                  <span>Access your {s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-lg bg-muted p-3 text-xs text-muted-foreground">
            <p><strong>Redirect URI:</strong> {redirectUri}</p>
            <p className="mt-1"><strong>Client ID:</strong> {clientId}</p>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={handleAllow} disabled={loading}>
              {loading ? "Authorizing..." : "Allow Access"}
            </Button>
            <Button variant="outline" onClick={handleDeny} disabled={loading}>
              Deny
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            You can revoke access at any time from your account settings
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
