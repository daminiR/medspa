import { Callout } from '@/components/docs/Callout'
import { StepList } from '@/components/docs/StepList'
import { Rocket, Server, Cloud, Globe, CheckCircle2, Zap, Shield } from 'lucide-react'

export default function DeploymentPage() {
  return (
    <div className="prose animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <div className="p-2 rounded-lg bg-primary-100">
          <Rocket className="w-6 h-6 text-primary-600" />
        </div>
        <span className="status-badge complete">
          <CheckCircle2 className="w-3 h-3" /> Complete
        </span>
      </div>
      <h1>Deployment Guide</h1>
      <p className="lead text-xl text-gray-500 mb-8">
        Deploy the Patient Portal to production with zero-config deployment on Vercel or
        alternative platforms.
      </p>

      <h2 id="overview">Deployment Options</h2>
      <p>
        The Patient Portal is built with Next.js 15 and can be deployed to any platform
        that supports Node.js. We recommend Vercel for the best experience.
      </p>

      <div className="grid md:grid-cols-3 gap-4 not-prose mb-8">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-5 h-5 text-primary-600" />
            <h3 className="font-semibold text-gray-900">Vercel</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">Zero-config deployment with automatic HTTPS and global CDN.</p>
          <div className="text-xs text-green-600 font-medium">✓ Recommended</div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Server className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">Railway</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">Simple container deployment with database support.</p>
          <div className="text-xs text-gray-500 font-medium">Good alternative</div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <Cloud className="w-5 h-5 text-gray-600" />
            <h3 className="font-semibold text-gray-900">AWS/GCP</h3>
          </div>
          <p className="text-sm text-gray-500 mb-3">Enterprise deployment with full control.</p>
          <div className="text-xs text-gray-500 font-medium">Advanced setup</div>
        </div>
      </div>

      <h2 id="vercel">Vercel Deployment (Recommended)</h2>
      <p>
        Vercel is the fastest way to deploy. Built by the creators of Next.js with
        automatic optimizations, global CDN, and zero configuration.
      </p>

      <h3 id="vercel-setup">Setup Steps</h3>
      <StepList
        steps={[
          {
            title: 'Create Vercel Account',
            description: 'Sign up at vercel.com with GitHub, GitLab, or Bitbucket',
          },
          {
            title: 'Import Repository',
            description: 'Click "New Project" → Import your Git repository',
          },
          {
            title: 'Configure Project',
            description: 'Set root directory to apps/patient-portal and framework to Next.js',
          },
          {
            title: 'Add Environment Variables',
            description: 'Copy all variables from .env.local to Vercel settings',
          },
          {
            title: 'Deploy',
            description: 'Click Deploy - Vercel handles build and deployment automatically',
          },
        ]}
      />

      <h3 id="vercel-env">Environment Variables</h3>
      <p>Add these in Vercel Dashboard → Settings → Environment Variables:</p>

      <div className="not-prose my-6 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm"><code>{`# Authentication
NEXTAUTH_URL=https://portal.yourspa.com
NEXTAUTH_SECRET=your-random-secret-key

# API
NEXT_PUBLIC_API_URL=https://api.yourspa.com

# Email (Choose one)
EMAIL_SERVER=smtp://apikey:YOUR_KEY@smtp.sendgrid.net:587
EMAIL_FROM=noreply@yourspa.com

# SMS (Optional)
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1234567890

# OAuth (Optional)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
FACEBOOK_CLIENT_ID=your_facebook_client_id
FACEBOOK_CLIENT_SECRET=your_facebook_client_secret`}</code></pre>
      </div>

      <Callout type="warning" title="Generate Secure Secret">
        Generate NEXTAUTH_SECRET with: <code>openssl rand -base64 32</code>
        Never commit secrets to git or reuse across environments.
      </Callout>

      <h3 id="vercel-domain">Custom Domain</h3>
      <p>Add your custom domain in Vercel:</p>
      <StepList
        steps={[
          {
            title: 'Go to Domains',
            description: 'Project Settings → Domains',
          },
          {
            title: 'Add Domain',
            description: 'Enter portal.yourspa.com or any subdomain',
          },
          {
            title: 'Configure DNS',
            description: 'Add CNAME record pointing to cname.vercel-dns.com',
          },
          {
            title: 'Automatic HTTPS',
            description: 'Vercel provisions SSL certificate automatically',
          },
        ]}
      />

      <h3 id="vercel-features">Vercel Features</h3>
      <ul>
        <li><strong>Automatic HTTPS:</strong> Free SSL certificates with auto-renewal</li>
        <li><strong>Global CDN:</strong> Edge network in 20+ regions</li>
        <li><strong>Preview Deployments:</strong> Automatic deploy for every PR</li>
        <li><strong>Analytics:</strong> Web Vitals and performance metrics</li>
        <li><strong>Serverless Functions:</strong> API routes scale automatically</li>
        <li><strong>Image Optimization:</strong> Automatic image resizing and format conversion</li>
      </ul>

      <h2 id="railway">Railway Deployment</h2>
      <p>
        Railway provides a simple alternative with Docker support and database hosting.
      </p>

      <h3 id="railway-setup">Setup Steps</h3>
      <StepList
        steps={[
          {
            title: 'Create Railway Account',
            description: 'Sign up at railway.app with GitHub',
          },
          {
            title: 'New Project',
            description: 'Click New → Deploy from GitHub repo',
          },
          {
            title: 'Configure Build',
            description: 'Railway auto-detects Next.js and uses correct build command',
          },
          {
            title: 'Add Variables',
            description: 'Settings → Variables → Add all environment variables',
          },
          {
            title: 'Deploy',
            description: 'Railway builds and deploys automatically',
          },
        ]}
      />

      <h3 id="railway-pricing">Railway Pricing</h3>
      <ul>
        <li><strong>Hobby:</strong> $5/month for starter projects</li>
        <li><strong>Pro:</strong> Pay-as-you-go based on usage</li>
        <li>Free trial includes $5 credit</li>
      </ul>

      <h2 id="aws">AWS Deployment</h2>
      <p>
        For enterprise deployments with full infrastructure control, deploy to AWS
        using Amplify, ECS, or EC2.
      </p>

      <h3 id="aws-amplify">AWS Amplify (Easiest)</h3>
      <p>Similar to Vercel but on AWS infrastructure:</p>

      <StepList
        steps={[
          {
            title: 'Create Amplify App',
            description: 'AWS Console → Amplify → New App → Host web app',
          },
          {
            title: 'Connect Repository',
            description: 'Authorize GitHub and select repository',
          },
          {
            title: 'Configure Build',
            description: 'Set root directory and Next.js build settings',
          },
          {
            title: 'Add Environment Variables',
            description: 'Environment variables → Add all required variables',
          },
          {
            title: 'Deploy',
            description: 'Save and deploy - Amplify handles CI/CD',
          },
        ]}
      />

      <h3 id="aws-ecs">AWS ECS (Advanced)</h3>
      <p>For containerized deployment with full control:</p>

      <div className="not-prose my-6 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm"><code>{`# Dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
EXPOSE 3000
CMD ["node", "server.js"]`}</code></pre>
      </div>

      <Callout type="info" title="Next.js Standalone Mode">
        Enable <code>output: 'standalone'</code> in next.config.js for Docker deployment.
        This creates a minimal production build.
      </Callout>

      <h2 id="docker">Docker Deployment</h2>
      <p>
        Deploy to any platform that supports Docker containers.
      </p>

      <h3 id="docker-compose">Docker Compose</h3>
      <div className="not-prose my-6 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm"><code>{`# docker-compose.yml
version: '3.8'
services:
  patient-portal:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3002:3000"
    environment:
      - NEXTAUTH_URL=https://portal.yourspa.com
      - NEXTAUTH_SECRET=\${NEXTAUTH_SECRET}
      - NEXT_PUBLIC_API_URL=https://api.yourspa.com
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./certs:/etc/nginx/certs
    depends_on:
      - patient-portal`}</code></pre>
      </div>

      <h2 id="domain-dns">Domain & DNS Setup</h2>

      <h3 id="dns-records">DNS Records</h3>
      <p>Configure these DNS records for your domain:</p>

      <div className="not-prose my-6">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Type</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Value</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Purpose</th>
              </tr>
            </thead>
            <tbody className="text-gray-600">
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">CNAME</td>
                <td className="py-3 px-4">portal</td>
                <td className="py-3 px-4">cname.vercel-dns.com</td>
                <td className="py-3 px-4">Portal subdomain</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">CNAME</td>
                <td className="py-3 px-4">www</td>
                <td className="py-3 px-4">cname.vercel-dns.com</td>
                <td className="py-3 px-4">WWW redirect</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-3 px-4 font-medium">TXT</td>
                <td className="py-3 px-4">_dmarc</td>
                <td className="py-3 px-4">v=DMARC1; p=none</td>
                <td className="py-3 px-4">Email security</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <h2 id="ssl-https">SSL / HTTPS Setup</h2>

      <h3 id="vercel-ssl">Vercel (Automatic)</h3>
      <p>
        Vercel automatically provisions and renews SSL certificates from Let's Encrypt.
        No configuration needed.
      </p>

      <h3 id="manual-ssl">Manual SSL Setup</h3>
      <p>For self-hosted deployments, use Let's Encrypt with Certbot:</p>

      <div className="not-prose my-6 bg-gray-900 text-gray-100 rounded-lg p-4 overflow-x-auto">
        <pre className="text-sm"><code>{`# Install Certbot
sudo apt-get update
sudo apt-get install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d portal.yourspa.com

# Auto-renewal
sudo systemctl enable certbot.timer
sudo systemctl start certbot.timer`}</code></pre>
      </div>

      <h2 id="performance">Performance Optimization</h2>

      <h3 id="caching">Caching Strategy</h3>
      <ul>
        <li><strong>Static Assets:</strong> Cache for 1 year with immutable flag</li>
        <li><strong>API Routes:</strong> No cache or short-lived (60s) for dynamic data</li>
        <li><strong>Pages:</strong> ISR (Incremental Static Regeneration) for public pages</li>
        <li><strong>Images:</strong> Cache optimized images for 30 days</li>
      </ul>

      <h3 id="cdn">CDN Configuration</h3>
      <p>
        Vercel provides global CDN out of the box. For other platforms, consider:
      </p>
      <ul>
        <li><strong>Cloudflare:</strong> Free CDN with DDoS protection</li>
        <li><strong>CloudFront:</strong> AWS CDN with edge locations worldwide</li>
        <li><strong>Fastly:</strong> Enterprise CDN with real-time purging</li>
      </ul>

      <h2 id="monitoring">Monitoring & Analytics</h2>

      <h3 id="vercel-analytics">Vercel Analytics</h3>
      <p>
        Built-in Web Vitals tracking:
      </p>
      <ul>
        <li>First Contentful Paint (FCP)</li>
        <li>Largest Contentful Paint (LCP)</li>
        <li>Cumulative Layout Shift (CLS)</li>
        <li>First Input Delay (FID)</li>
      </ul>

      <h3 id="external-monitoring">External Monitoring</h3>
      <ul>
        <li><strong>Sentry:</strong> Error tracking and performance monitoring</li>
        <li><strong>LogRocket:</strong> Session replay and user monitoring</li>
        <li><strong>Datadog:</strong> Full-stack observability</li>
        <li><strong>New Relic:</strong> APM and infrastructure monitoring</li>
      </ul>

      <h2 id="scaling">Scaling Considerations</h2>

      <h3 id="serverless-scaling">Serverless Scaling</h3>
      <p>
        On Vercel/Netlify, API routes scale automatically with traffic. No manual
        configuration needed.
      </p>

      <h3 id="database-scaling">Database Scaling</h3>
      <ul>
        <li>Use connection pooling (PgBouncer for PostgreSQL)</li>
        <li>Implement read replicas for heavy read traffic</li>
        <li>Cache frequent queries with Redis</li>
        <li>Consider serverless databases (Neon, PlanetScale) for auto-scaling</li>
      </ul>

      <h2 id="security">Security Checklist</h2>

      <div className="not-prose my-6">
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="mt-1" />
            <label>HTTPS enabled with valid SSL certificate</label>
          </div>
          <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="mt-1" />
            <label>Environment variables stored securely (not in git)</label>
          </div>
          <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="mt-1" />
            <label>CORS configured to allow only your API domain</label>
          </div>
          <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="mt-1" />
            <label>CSP (Content Security Policy) headers configured</label>
          </div>
          <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="mt-1" />
            <label>Rate limiting enabled on API routes</label>
          </div>
          <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="mt-1" />
            <label>Security headers (HSTS, X-Frame-Options, etc.) configured</label>
          </div>
          <div className="flex items-start gap-2 p-3 bg-white border border-gray-200 rounded-lg">
            <input type="checkbox" className="mt-1" />
            <label>Regular dependency updates and security patches</label>
          </div>
        </div>
      </div>

      <h2 id="troubleshooting">Deployment Troubleshooting</h2>

      <h3 id="build-failures">Build Failures</h3>
      <ul>
        <li><strong>Missing env vars:</strong> Check all required variables are set</li>
        <li><strong>Type errors:</strong> Run <code>npm run type-check</code> locally first</li>
        <li><strong>Dependency issues:</strong> Delete node_modules and package-lock.json, reinstall</li>
        <li><strong>Out of memory:</strong> Increase Node memory: <code>NODE_OPTIONS=--max-old-space-size=4096</code></li>
      </ul>

      <h3 id="runtime-errors">Runtime Errors</h3>
      <ul>
        <li><strong>API not reachable:</strong> Verify NEXT_PUBLIC_API_URL is correct and API has CORS enabled</li>
        <li><strong>Auth not working:</strong> Check NEXTAUTH_URL matches deployed domain</li>
        <li><strong>Images not loading:</strong> Verify Next.js image domains are configured</li>
      </ul>

      <Callout type="success" title="Deployment Complete">
        Your Patient Portal is now live! Monitor performance, gather user feedback,
        and iterate based on usage patterns.
      </Callout>
    </div>
  )
}
