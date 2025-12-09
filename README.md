# Medical Spa Platform

Enterprise-grade SaaS platform for medical spas.

## Architecture

- **Web**: Customer-facing portal
- **Admin**: Multi-tenant admin dashboard  
- **API**: Main REST API service
- **Scheduler**: Dedicated scheduling microservice
- **AI Service**: Python-based AI/ML service
- **Notifications**: Email/SMS service
- **Workers**: Background job processing
- **Realtime**: WebSocket service for live updates

## Quick Start

```bash
# Install dependencies
pnpm install

# Start all services
pnpm dev

# Start specific service
pnpm dev:web
pnpm dev:api
pnpm dev:ai

# Docker services
pnpm docker:up
