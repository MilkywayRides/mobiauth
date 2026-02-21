export async function sendVerificationEmail(to: string, url: string) {
    if (process.env.RESEND_API_KEY) {
        try {
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: process.env.EMAIL_FROM || "noreply@authplatform.dev",
                    to,
                    subject: "Verify your email address",
                    html: `
            <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 16px;">Verify your email</h1>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">Click the button below to verify your email address. This link expires in 24 hours.</p>
              <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">Verify Email</a>
              <p style="color: #999; font-size: 13px;">If you did not create an account, ignore this email.</p>
            </div>
          `,
                }),
            });

            if (!res.ok) {
                console.error("[Email] Failed to send verification email:", await res.text());
            }
        } catch (err) {
            console.error("[Email] Error sending verification email:", err);
        }
    } else {
        console.log("\n╔══════════════════════════════════════════╗");
        console.log("║       📧 VERIFICATION EMAIL              ║");
        console.log("╠══════════════════════════════════════════╣");
        console.log(`║ To:  ${to}`);
        console.log(`║ URL: ${url}`);
        console.log("╚══════════════════════════════════════════╝\n");
    }
}

export async function sendPasswordResetEmail(to: string, url: string) {
    if (process.env.RESEND_API_KEY) {
        try {
            const res = await fetch("https://api.resend.com/emails", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
                },
                body: JSON.stringify({
                    from: process.env.EMAIL_FROM || "noreply@authplatform.dev",
                    to,
                    subject: "Reset your password",
                    html: `
            <div style="font-family: 'Inter', -apple-system, sans-serif; max-width: 500px; margin: 0 auto; padding: 40px 20px;">
              <h1 style="color: #1a1a2e; font-size: 24px; margin-bottom: 16px;">Reset your password</h1>
              <p style="color: #555; font-size: 16px; line-height: 1.6;">Click the button below to set a new password. This link expires in 1 hour.</p>
              <a href="${url}" style="display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0;">Reset Password</a>
              <p style="color: #999; font-size: 13px;">If you did not request a password reset, ignore this email.</p>
            </div>
          `,
                }),
            });

            if (!res.ok) {
                console.error("[Email] Failed to send reset email:", await res.text());
            }
        } catch (err) {
            console.error("[Email] Error sending reset email:", err);
        }
    } else {
        console.log("\n╔══════════════════════════════════════════╗");
        console.log("║       🔑 PASSWORD RESET EMAIL            ║");
        console.log("╠══════════════════════════════════════════╣");
        console.log(`║ To:  ${to}`);
        console.log(`║ URL: ${url}`);
        console.log("╚══════════════════════════════════════════╝\n");
    }
}
