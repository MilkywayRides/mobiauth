import Link from "next/link";
import { Shield, Key, Users, QrCode, Lock, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            <span className="text-lg font-bold">BlazeNeuro Auth</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm">
                Sign in
              </Button>
            </Link>
            <Link href="/auth/signup">
              <Button size="sm">Get started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main>
        <div className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
          <h1 className="text-5xl md:text-6xl font-bold leading-tight tracking-tight">
            Authentication
            <br />
            <span className="text-muted-foreground">
              Built for Scale
            </span>
          </h1>

          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            A production-ready auth platform with OAuth, QR login, RBAC,
            session management, and admin controls. Powered by Better Auth.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/auth/signup">
              <Button size="lg" className="gap-2">
                Create Account
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">
                Sign in
              </Button>
            </Link>
          </div>
        </div>

        {/* Features grid */}
        <div className="max-w-5xl mx-auto px-6 pb-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: Key,
                title: "Multi-Provider Auth",
                desc: "Google, GitHub OAuth plus email/password with secure hashing and email verification.",
              },
              {
                icon: QrCode,
                title: "QR Code Login",
                desc: "Scan from your phone to instantly authenticate on desktop. Session bridge in seconds.",
              },
              {
                icon: Users,
                title: "Admin Dashboard",
                desc: "Manage users, roles, sessions. Ban, deactivate, or promote users with full RBAC.",
              },
              {
                icon: Shield,
                title: "Enterprise Security",
                desc: "Rate limiting, CSRF protection, HttpOnly cookies, token rotation, and brute-force guards.",
              },
              {
                icon: Lock,
                title: "Role-Based Access",
                desc: "User, Admin, Super Admin roles with middleware enforcement and route-level protection.",
              },
              {
                icon: ArrowRight,
                title: "Scalable by Design",
                desc: "Ready for SSO, passkeys, 2FA, multi-tenant, and organization roles out of the box.",
              },
            ].map((feature) => (
              <Card key={feature.title}>
                <CardHeader>
                  <feature.icon className="h-5 w-5 text-muted-foreground mb-2" />
                  <CardTitle className="text-base">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="leading-relaxed">
                    {feature.desc}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
