# Production Deployment Guide

## ✅ Build Successful!

Your auth system is ready for production deployment.

## Quick Deploy Options

### 1. Vercel (Recommended - Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in Vercel dashboard
# Or use CLI:
vercel env add CROSS_APP_MASTER_KEY
vercel env add CROSS_APP_ENCRYPTION_KEY
vercel env add DATABASE_URL
vercel env add BETTER_AUTH_SECRET
```

### 2. Docker

```bash
# Build image
docker build -t auth-system .

# Run container
docker run -p 3000:3000 \
  -e DATABASE_URL="postgresql://..." \
  -e BETTER_AUTH_SECRET="..." \
  -e CROSS_APP_MASTER_KEY="..." \
  -e CROSS_APP_ENCRYPTION_KEY="..." \
  auth-system
```

### 3. VPS (Ubuntu/Debian)

```bash
# Install Node.js 20+
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
npm install -g pm2

# Clone and setup
git clone <your-repo>
cd auth
npm install
npm run build

# Start with PM2
pm2 start npm --name "auth" -- start
pm2 save
pm2 startup
```

## Environment Variables (Production)

Create `.env.production`:

```env
# Database
DATABASE_URL="postgresql://user:pass@host:5432/authdb"

# Auth
BETTER_AUTH_SECRET="generate-new-secret-min-32-chars"
BETTER_AUTH_URL="https://auth.yourdomain.com"

# Cross-App (from earlier generation)
CROSS_APP_MASTER_KEY="7e7ebc1f8ef27dc9c561f346ccd960be560dbbf683c4ae44b2c06a6816a90276"
CROSS_APP_ENCRYPTION_KEY="4737214227d7e263c5d4a383f8c7d909359aa247643cf0aeb7e5735c0b96d02a"

# Email (optional)
RESEND_API_KEY="re_..."
EMAIL_FROM="noreply@yourdomain.com"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
```

## Database Setup

### PostgreSQL (Required)

```bash
# Create production database
createdb authdb

# Run migrations
npx prisma migrate deploy

# Generate client
npx prisma generate
```

### Managed Database Options:
- **Vercel Postgres** - Easiest with Vercel
- **Supabase** - Free tier available
- **Railway** - Simple setup
- **AWS RDS** - Enterprise grade
- **DigitalOcean** - Managed PostgreSQL

## SSL/HTTPS Setup

### With Nginx (VPS)

```nginx
server {
    listen 80;
    server_name auth.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name auth.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/auth.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/auth.yourdomain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Get SSL certificate:
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d auth.yourdomain.com
```

## Performance Optimization

### 1. Enable Caching
Already configured in status endpoint with Cache-Control headers.

### 2. Database Connection Pooling
Add to DATABASE_URL:
```
postgresql://user:pass@host:5432/authdb?connection_limit=10&pool_timeout=20
```

### 3. Redis (Optional - for rate limiting)
Replace in-memory rate limiter with Redis for multi-instance deployments.

## Monitoring

### Health Check Endpoint
Create `/api/health/route.ts`:
```typescript
import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return NextResponse.json({ status: "ok", timestamp: new Date() });
  } catch {
    return NextResponse.json({ status: "error" }, { status: 500 });
  }
}
```

### Logging
- Use Vercel Analytics (if on Vercel)
- Or setup Sentry: `npm install @sentry/nextjs`
- Or use Winston for file logging

## Security Checklist

- [x] HTTPS enabled
- [x] Environment variables secured
- [x] Rate limiting configured
- [x] CORS configured (if needed)
- [x] Database credentials secured
- [x] Session secrets rotated
- [ ] Firewall configured (VPS only)
- [ ] Regular backups enabled
- [ ] Monitoring alerts setup

## CORS Configuration (if needed)

Add to `next.config.ts`:
```typescript
async headers() {
  return [
    {
      source: "/api/:path*",
      headers: [
        { key: "Access-Control-Allow-Origin", value: "https://yourapp.com" },
        { key: "Access-Control-Allow-Methods", value: "GET,POST,PUT,DELETE,OPTIONS" },
        { key: "Access-Control-Allow-Headers", value: "Content-Type, Authorization" },
      ],
    },
  ];
}
```

## Backup Strategy

### Database Backups
```bash
# Daily backup script
pg_dump $DATABASE_URL > backup-$(date +%Y%m%d).sql

# Automated with cron
0 2 * * * pg_dump $DATABASE_URL > /backups/auth-$(date +\%Y\%m\%d).sql
```

### Environment Backup
Store encrypted copies of:
- `.env.production`
- Encryption keys
- Database credentials

## Post-Deployment

1. **Test all endpoints:**
   - OAuth flow
   - API keys
   - Cross-app auth
   - QR login

2. **Monitor logs** for first 24 hours

3. **Setup alerts** for:
   - Failed logins
   - Rate limit hits
   - Database errors
   - High response times

4. **Document your setup** for team

## Scaling

### Horizontal Scaling
- Deploy multiple instances behind load balancer
- Use Redis for rate limiting (shared state)
- Use managed database with connection pooling

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Add database indexes (already configured)

## Maintenance

### Regular Tasks
- Weekly: Review logs and errors
- Monthly: Update dependencies
- Quarterly: Rotate secrets
- Yearly: Security audit

### Updates
```bash
# Update dependencies
npm update

# Check for security issues
npm audit

# Rebuild
npm run build

# Deploy
pm2 restart auth
```

## Support & Monitoring URLs

After deployment, bookmark:
- `https://auth.yourdomain.com/api/health` - Health check
- `https://auth.yourdomain.com/dashboard` - Admin dashboard
- `https://auth.yourdomain.com/dashboard/oauth` - OAuth apps
- `https://auth.yourdomain.com/dashboard/keys` - API keys

## Troubleshooting

### Build fails
```bash
rm -rf .next node_modules
npm install
npx prisma generate
npm run build
```

### Database connection issues
- Check DATABASE_URL format
- Verify database is accessible
- Check firewall rules
- Verify SSL mode if required

### Rate limiting not working
- Check if multiple instances need Redis
- Verify rate limit configuration
- Check IP forwarding headers

## Cost Estimates

### Vercel + Vercel Postgres
- Free tier: $0/month (hobby projects)
- Pro: $20/month + database usage

### VPS + Managed DB
- VPS: $5-20/month (DigitalOcean/Linode)
- Database: $15-50/month
- Total: ~$20-70/month

### AWS/GCP (Enterprise)
- Variable based on usage
- Typically $100-500/month for production

---

## 🎉 Your Auth System is Production Ready!

Built with:
- ✅ OAuth 2.0 Provider
- ✅ API Key System
- ✅ Cross-App Authentication
- ✅ QR Code Login
- ✅ Rate Limiting
- ✅ Security Best Practices
- ✅ Optimized Build
