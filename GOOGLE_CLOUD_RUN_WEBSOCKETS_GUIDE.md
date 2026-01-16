# Google Cloud Run WebSockets Implementation Guide (2024-2025)

> **Last Updated:** December 2024
> **Status:** Production-Ready with Limitations

## Table of Contents
1. [Overview](#overview)
2. [WebSocket Support Status](#websocket-support-status)
3. [Key Limitations & Considerations](#key-limitations--considerations)
4. [Architecture Recommendations](#architecture-recommendations)
5. [Implementation Guide](#implementation-guide)
6. [Configuration & Deployment](#configuration--deployment)
7. [Best Practices](#best-practices)
8. [Pricing & Cost Analysis](#pricing--cost-analysis)
9. [Alternatives Comparison](#alternatives-comparison)
10. [Production Examples](#production-examples)
11. [Sources](#sources)

---

## Overview

Google Cloud Run **fully supports WebSockets** as of 2021, with **no additional configuration required**. However, there are important architectural considerations and limitations you must understand before choosing Cloud Run for WebSocket workloads.

### Key Facts
- **Native Support:** WebSockets work out-of-the-box on Cloud Run
- **Maximum Timeout:** 60 minutes (connections auto-terminate after)
- **Default Timeout:** 5 minutes (must be explicitly increased)
- **Concurrency:** Up to 1,000 concurrent connections per container
- **Scaling:** Up to 1,000 instances (250,000+ concurrent clients possible)
- **Billing:** Active containers with open WebSocket connections are continuously billed

---

## WebSocket Support Status

### What Works
- ✅ WebSocket protocol (ws:// and wss://)
- ✅ HTTP/2 bidirectional streams
- ✅ gRPC streaming
- ✅ Session affinity (best-effort)
- ✅ Automatic scaling based on connection load
- ✅ Integration with libraries like Socket.io, ws, Hono WebSocket helper

### What Doesn't Work / Has Limitations
- ❌ Connections lasting longer than 60 minutes (hard limit)
- ❌ Guaranteed session affinity (only "best effort")
- ❌ HTTP/2 end-to-end (must be disabled for WebSockets)
- ⚠️ Shared state across instances (requires external synchronization)
- ⚠️ Cold starts impact connection establishment latency
- ⚠️ Expensive at scale compared to VM-based solutions

---

## Key Limitations & Considerations

### 1. 60-Minute Maximum Timeout

**Problem:**
WebSocket requests are treated as long-running HTTP requests subject to Cloud Run's request timeout limits.

**Details:**
- Default timeout: 5 minutes (300 seconds)
- Maximum timeout: 60 minutes (3,600 seconds)
- After timeout, connection is forcibly terminated

**Solution:**
```bash
# Increase timeout to maximum (60 minutes)
gcloud run services update SERVICE_NAME --timeout=3600
```

**Impact:**
> "While Cloud Run supports WebSocket connections, they are subject to the same maximum timeout of 60 minutes, making it unsuitable for long-lived persistent connections. For real-time applications requiring indefinite WebSocket connections, chat applications, or live streaming, consider Google Kubernetes Engine or Compute Engine where you can maintain persistent connections."

**Recommendation:**
- Implement client-side reconnection logic
- Use heartbeat/ping-pong to detect dead connections early
- Design your application to handle frequent reconnections gracefully

---

### 2. Session Affinity (Best Effort Only)

**Problem:**
Multiple WebSocket connections from the same client may hit different Cloud Run instances.

**Details:**
- Cloud Run uses cookies for session affinity (30-day TTL)
- Autoscaling can cause new connections to route to different instances
- No guaranteed sticky sessions due to load balancing

**Solution:**
```bash
# Enable session affinity (best effort)
gcloud run services update SERVICE_NAME --session-affinity
```

**Impact:**
> "Session affinity on Cloud Run provides best effort affinity, but new WebSocket requests could still potentially connect to different instances, due to built-in load balancing. To solve this problem, you need to synchronize data between instances."

**Recommendation:**
- **Never rely on in-memory state**
- Use external data stores (Redis, Firestore) for shared state
- Implement Redis Pub/Sub for real-time synchronization across instances

---

### 3. Billing Implications

**Problem:**
WebSocket connections keep containers active continuously, resulting in high costs at scale.

**Details:**
> "A Cloud Run instance that has any open WebSocket connection is considered active, so CPU is allocated and the service is billed as instance-based billing."

**Cost Analysis (Example Scenario):**

| Metric | Value |
|--------|-------|
| Concurrent Connections | 250,000 |
| Max Concurrency per Container | 250 |
| Required Instances | 1,000 |
| Configuration | 2 vCPU + 1GB RAM |
| **Monthly Cost (Cloud Run only)** | **~$100,000** |
| **Excludes:** | Redis, VPC, networking |

**Real-World Experience:**
> "Assuming a rather frugal 2 vCPU with just 1GB of memory — ignoring the Redis and VPC costs — just Cloud Run would cost almost $100,000 per month at 250k connections! It is a steep price and it might be a better fit for loads that don't need to run as many instances, or for short-term scaling needs like an unanticipated launch/marketing event."

**Recommendation:**
- Cloud Run is cost-effective for **<10,000 concurrent connections**
- For predictable, high-volume loads: migrate to GKE or Compute Engine
- Expected savings: **up to 50x cheaper** with VM-based solutions at scale

---

### 4. Concurrency Settings

**Problem:**
Default concurrency settings may not be optimal for WebSocket workloads.

**Details:**
- Default concurrency: 80 requests per container
- Maximum concurrency: 1,000 requests per container
- WebSocket connections count as concurrent requests

**Solution:**
```bash
# Increase concurrency for WebSocket services
gcloud run services update SERVICE_NAME --concurrency=1000
```

**Recommendation:**
> "WebSockets services are typically designed to handle many connections simultaneously. Since Cloud Run supports concurrent connections (up to 1000 per container), you should increase the maximum concurrency setting for your container to a higher value than the default if your service is able to handle the load with given resources."

**Memory Considerations:**
- Each WebSocket connection consumes memory
- Monitor container memory usage
- Scale vertically (more RAM per container) if needed
- Scale horizontally (more containers) for better cost efficiency

---

## Architecture Recommendations

### Recommended Architecture for Production WebSockets on Cloud Run

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│              (Web Browsers, Mobile Apps, etc.)              │
└────────────────────┬────────────────────────────────────────┘
                     │
                     │ WebSocket connections (wss://)
                     │ Session affinity enabled (best effort)
                     │
┌────────────────────▼────────────────────────────────────────┐
│                  Google Cloud Load Balancer                  │
│                    (Automatic SSL/TLS)                       │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
┌───────▼────────┐       ┌───────▼────────┐
│  Cloud Run     │       │  Cloud Run     │
│  Instance 1    │  ...  │  Instance N    │
│                │       │                │
│ ┌────────────┐ │       │ ┌────────────┐ │
│ │ WebSocket  │ │       │ │ WebSocket  │ │
│ │ Handler    │ │       │ │ Handler    │ │
│ └──────┬─────┘ │       │ └──────┬─────┘ │
└────────┼────────┘       └────────┼────────┘
         │                         │
         │    VPC Connector        │
         └────────┬────────────────┘
                  │
        ┌─────────▼─────────┐
        │  Memorystore       │
        │  (Redis)           │
        │                    │
        │  ┌──────────────┐  │
        │  │  Pub/Sub     │  │
        │  │  Channels    │  │
        │  └──────────────┘  │
        │                    │
        │  ┌──────────────┐  │
        │  │  Shared      │  │
        │  │  State       │  │
        │  └──────────────┘  │
        └────────────────────┘
```

### Critical Components

#### 1. **Cloud Run Service**
- Handles WebSocket connections
- Must be stateless
- Connects to Redis for state synchronization

#### 2. **VPC Connector**
- Required for private connection to Memorystore
- Enables low-latency Redis access

#### 3. **Memorystore for Redis**
- **Pub/Sub:** Broadcasts messages to all Cloud Run instances
- **Shared State:** Stores session data, user lists, room info
- **Persistence:** Optional for critical data

#### 4. **Session Affinity**
- Best-effort routing to same instance
- Improves user experience on reconnections
- Not guaranteed - design for failures

### Why This Architecture?

> "The most difficult part of creating WebSockets services on Cloud Run is synchronizing data between multiple Cloud Run instances. This is difficult because of the autoscaling and stateless nature of instances, and because of the limits for concurrency and request timeouts."

**Redis Pub/Sub Solves This:**
> "In a Redis-based architecture, each Cloud Run instance establishes a long-running connection to the Redis channel that contains the received messages (using the SUBSCRIBE command). Once the container instances receive a new message on the channel, they can send it to their clients over WebSockets in real-time."

---

## Implementation Guide

### Option 1: Node.js with Socket.io (Recommended for Most Use Cases)

#### Why Socket.io?
- Automatic reconnection handling
- Fallback to HTTP long-polling if WebSocket fails
- Broadcasting and room management built-in
- Production-tested with millions of connections

#### Step 1: Install Dependencies

```bash
npm install express socket.io redis
```

#### Step 2: Server Implementation

```javascript
// server.js
const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const { createClient } = require('redis');

const app = express();
const httpServer = createServer(app);

// Socket.io server with CORS configuration
const io = new Server(httpServer, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  },
  // Connection timeout configuration
  pingTimeout: 60000,
  pingInterval: 25000,
  // Transports configuration
  transports: ['websocket', 'polling']
});

// Redis clients for Pub/Sub
const pubClient = createClient({
  url: `redis://${process.env.REDISHOST}:${process.env.REDISPORT || 6379}`
});

const subClient = pubClient.duplicate();

// Connect to Redis
Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => {
    console.log('Connected to Redis');
    setupSocketHandlers();
  })
  .catch(err => {
    console.error('Redis connection error:', err);
    process.exit(1);
  });

function setupSocketHandlers() {
  io.on('connection', async (socket) => {
    console.log('Client connected:', socket.id);

    // Store connection metadata in Redis
    await pubClient.hSet(`socket:${socket.id}`, {
      connectedAt: Date.now(),
      instanceId: process.env.K_REVISION || 'local'
    });

    // Handle client events
    socket.on('message', async (data) => {
      // Broadcast to all instances via Redis Pub/Sub
      await pubClient.publish('messages', JSON.stringify({
        type: 'message',
        data,
        from: socket.id,
        timestamp: Date.now()
      }));
    });

    socket.on('disconnect', async () => {
      console.log('Client disconnected:', socket.id);
      await pubClient.del(`socket:${socket.id}`);
    });

    // Handle errors
    socket.on('error', (err) => {
      console.error('Socket error:', err);
    });
  });

  // Subscribe to Redis messages and broadcast to connected clients
  subClient.subscribe('messages', (message) => {
    const msg = JSON.parse(message);
    // Broadcast to all connected sockets on this instance
    io.emit('message', msg.data);
  });
}

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    connections: io.engine.clientsCount,
    instanceId: process.env.K_REVISION || 'local'
  });
});

// Start server
const PORT = process.env.PORT || 8080;
httpServer.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  httpServer.close(async () => {
    await pubClient.quit();
    await subClient.quit();
    process.exit(0);
  });
});
```

#### Step 3: Client Implementation

```javascript
// client.js
import { io } from 'socket.io-client';

// Connect with automatic reconnection
const socket = io('wss://your-service.run.app', {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  reconnectionAttempts: Infinity,
  transports: ['websocket', 'polling']
});

socket.on('connect', () => {
  console.log('Connected to server');
});

socket.on('message', (data) => {
  console.log('Received message:', data);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
  // Automatic reconnection will handle this
});

socket.on('reconnect', (attemptNumber) => {
  console.log('Reconnected after', attemptNumber, 'attempts');
});

socket.on('error', (error) => {
  console.error('Socket error:', error);
});

// Send message
function sendMessage(text) {
  socket.emit('message', { text, timestamp: Date.now() });
}
```

---

### Option 2: Node.js with Hono Framework

Hono is a modern, lightweight web framework optimized for edge and serverless environments.

#### Why Hono?
- Fast and lightweight
- First-class TypeScript support
- Built for serverless/edge environments
- Clean, minimal API

#### Step 1: Install Dependencies

```bash
npm install hono @hono/node-server @hono/node-ws ws redis
```

#### Step 2: Server Implementation

```typescript
// server.ts
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { upgradeWebSocket } from '@hono/node-ws';
import { createClient } from 'redis';

const app = new Hono();

// Redis setup
const redisHost = process.env.REDISHOST || 'localhost';
const redisPort = parseInt(process.env.REDISPORT || '6379');

const pubClient = createClient({ url: `redis://${redisHost}:${redisPort}` });
const subClient = pubClient.duplicate();

await Promise.all([pubClient.connect(), subClient.connect()]);

// Store connected clients
const clients = new Set<any>();

// WebSocket route
app.get(
  '/ws',
  upgradeWebSocket((c) => {
    return {
      onOpen: async (evt, ws) => {
        console.log('Client connected');
        clients.add(ws);

        // Send welcome message
        ws.send(JSON.stringify({ type: 'welcome', timestamp: Date.now() }));
      },

      onMessage: async (event, ws) => {
        const message = event.data.toString();
        console.log('Received:', message);

        // Publish to Redis for distribution to all instances
        await pubClient.publish('messages', JSON.stringify({
          type: 'message',
          data: message,
          timestamp: Date.now()
        }));
      },

      onClose: (evt, ws) => {
        console.log('Client disconnected');
        clients.delete(ws);
      },

      onError: (evt, ws) => {
        console.error('WebSocket error:', evt);
      }
    };
  })
);

// Subscribe to Redis messages
subClient.subscribe('messages', (message) => {
  const msg = JSON.parse(message);

  // Broadcast to all connected clients on this instance
  clients.forEach(client => {
    try {
      client.send(JSON.stringify(msg));
    } catch (err) {
      console.error('Error sending to client:', err);
      clients.delete(client);
    }
  });
});

// Health check
app.get('/health', (c) => {
  return c.json({
    status: 'healthy',
    connections: clients.size,
    instanceId: process.env.K_REVISION || 'local'
  });
});

// Start server
const port = parseInt(process.env.PORT || '8080');
console.log(`Server is running on port ${port}`);

serve({
  fetch: app.fetch,
  port
});
```

---

### Option 3: Native WebSocket (ws library)

For maximum control and minimal overhead.

```javascript
// server.js
const express = require('express');
const { WebSocketServer } = require('ws');
const { createClient } = require('redis');
const http = require('http');

const app = express();
const server = http.createServer(app);

// WebSocket server
const wss = new WebSocketServer({
  server,
  path: '/ws'
});

// Redis setup
const pubClient = createClient({
  url: `redis://${process.env.REDISHOST}:${process.env.REDISPORT || 6379}`
});
const subClient = pubClient.duplicate();

Promise.all([pubClient.connect(), subClient.connect()])
  .then(() => console.log('Redis connected'))
  .catch(err => console.error('Redis error:', err));

// Heartbeat to detect broken connections
function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  ws.on('message', async (data) => {
    const message = data.toString();

    // Publish to Redis
    await pubClient.publish('messages', JSON.stringify({
      data: message,
      timestamp: Date.now()
    }));
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });

  ws.on('error', (err) => {
    console.error('WebSocket error:', err);
  });
});

// Subscribe to Redis and broadcast to all clients
subClient.subscribe('messages', (message) => {
  const msg = JSON.parse(message);

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
});

// Ping clients every 30 seconds to detect broken connections
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    connections: wss.clients.size
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Configuration & Deployment

### Step 1: Create Dockerfile

```dockerfile
# Dockerfile
FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose port (Cloud Run will override this)
EXPOSE 8080

# Start application
CMD ["node", "server.js"]
```

### Step 2: Create Memorystore for Redis

```bash
# Create Redis instance (requires VPC)
gcloud redis instances create websocket-redis \
  --size=1 \
  --region=us-central1 \
  --redis-version=redis_7_0 \
  --tier=basic

# Get Redis host
gcloud redis instances describe websocket-redis \
  --region=us-central1 \
  --format="value(host)"
```

### Step 3: Create VPC Connector

```bash
# Create VPC connector for Cloud Run to access Redis
gcloud compute networks vpc-access connectors create websocket-connector \
  --region=us-central1 \
  --range=10.8.0.0/28
```

### Step 4: Deploy to Cloud Run

```bash
# Build and deploy
gcloud run deploy websocket-service \
  --source . \
  --region=us-central1 \
  --platform=managed \
  --allow-unauthenticated \
  --timeout=3600 \
  --concurrency=1000 \
  --min-instances=1 \
  --max-instances=100 \
  --cpu=2 \
  --memory=2Gi \
  --vpc-connector=websocket-connector \
  --session-affinity \
  --set-env-vars="REDISHOST=YOUR_REDIS_HOST,REDISPORT=6379"
```

### Configuration Breakdown

| Flag | Value | Reason |
|------|-------|--------|
| `--timeout` | 3600 | Maximum 60-minute connection lifespan |
| `--concurrency` | 1000 | Handle many simultaneous WebSocket connections |
| `--min-instances` | 1 | Avoid cold starts for first connections |
| `--max-instances` | 100 | Scale to handle load spikes |
| `--cpu` | 2 | Sufficient for message processing |
| `--memory` | 2Gi | Each connection uses ~1-2MB memory |
| `--vpc-connector` | Required | Private connection to Redis |
| `--session-affinity` | Enabled | Best-effort sticky sessions |

### Step 5: Update Service Configuration (if needed)

```bash
# Update timeout
gcloud run services update websocket-service --timeout=3600

# Update concurrency
gcloud run services update websocket-service --concurrency=1000

# Update instance limits
gcloud run services update websocket-service \
  --min-instances=1 \
  --max-instances=100

# Enable session affinity
gcloud run services update websocket-service --session-affinity
```

---

## Best Practices

### 1. Implement Robust Reconnection Logic

**Why:**
> "WebSockets clients connecting to Cloud Run should handle reconnecting to the server if the request times out or the server disconnects."

**Client-Side Reconnection:**

```javascript
import ReconnectingWebSocket from 'reconnecting-websocket';

const ws = new ReconnectingWebSocket('wss://your-service.run.app/ws', [], {
  connectionTimeout: 10000,
  maxRetries: Infinity,
  maxReconnectionDelay: 10000,
  minReconnectionDelay: 1000,
  reconnectionDelayGrowFactor: 1.3,
});

ws.addEventListener('open', () => {
  console.log('Connected');
});

ws.addEventListener('message', (event) => {
  console.log('Message:', event.data);
});

ws.addEventListener('close', (event) => {
  console.log('Connection closed:', event.code, event.reason);
});

ws.addEventListener('error', (error) => {
  console.error('Error:', error);
});
```

**Server-Side Connection Tracking:**

```javascript
const connections = new Map();

ws.on('connection', (socket) => {
  const connectionId = generateUniqueId();

  connections.set(connectionId, {
    socket,
    connectedAt: Date.now(),
    lastPing: Date.now()
  });

  socket.on('close', () => {
    connections.delete(connectionId);
  });
});
```

---

### 2. Implement Heartbeat/Ping-Pong

**Why:**
> "Ping pong frames act as a built-in keepalive and heartbeat mechanism for WebSockets. They allow both endpoints to detect unreachable peers, network partitions, or idle connections, enabling timely cleanup or reconnection."

**Recommended Interval:** 20-30 seconds

**Server-Side Ping (Native ws):**

```javascript
const WebSocket = require('ws');
const wss = new WebSocketServer({ server });

function heartbeat() {
  this.isAlive = true;
}

wss.on('connection', (ws) => {
  ws.isAlive = true;
  ws.on('pong', heartbeat);

  ws.on('message', (data) => {
    // Handle message
  });
});

// Ping every 30 seconds
const interval = setInterval(() => {
  wss.clients.forEach((ws) => {
    if (ws.isAlive === false) {
      console.log('Terminating dead connection');
      return ws.terminate();
    }

    ws.isAlive = false;
    ws.ping();
  });
}, 30000);

wss.on('close', () => {
  clearInterval(interval);
});
```

**Client-Side Heartbeat:**

```javascript
let heartbeatInterval;

socket.on('connect', () => {
  // Start heartbeat
  heartbeatInterval = setInterval(() => {
    socket.emit('ping', { timestamp: Date.now() });
  }, 25000); // 25 seconds
});

socket.on('disconnect', () => {
  clearInterval(heartbeatInterval);
});

socket.on('pong', (data) => {
  // Connection is alive
  console.log('Heartbeat received');
});
```

---

### 3. Use External State Management (Critical!)

**Why:**
> "Clients connecting to your Cloud Run service might end up being serviced by different instances that do not coordinate or share data. You need to synchronize data to make sure clients connecting to a Cloud Run service receive the same data from the WebSockets connection."

**Redis Pub/Sub Pattern:**

```javascript
// Publisher (on message receipt)
async function broadcastMessage(message) {
  await pubClient.publish('chat:messages', JSON.stringify({
    id: generateId(),
    data: message,
    timestamp: Date.now(),
    instanceId: process.env.K_REVISION
  }));
}

// Subscriber (on all instances)
subClient.subscribe('chat:messages', (message) => {
  const msg = JSON.parse(message);

  // Broadcast to all local WebSocket connections
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(msg));
    }
  });
});
```

**Shared State in Redis:**

```javascript
// Store user session
async function storeUserSession(userId, sessionData) {
  await pubClient.hSet(`user:${userId}`, {
    socketId: sessionData.socketId,
    connectedAt: Date.now(),
    instanceId: process.env.K_REVISION,
    ...sessionData
  });

  // Set expiry
  await pubClient.expire(`user:${userId}`, 3600);
}

// Get user session
async function getUserSession(userId) {
  return await pubClient.hGetAll(`user:${userId}`);
}

// Store room participants
async function addUserToRoom(roomId, userId) {
  await pubClient.sAdd(`room:${roomId}:participants`, userId);
}

// Get room participants
async function getRoomParticipants(roomId) {
  return await pubClient.sMembers(`room:${roomId}:participants`);
}
```

---

### 4. Monitor Connection Health

**Metrics to Track:**

```javascript
const metrics = {
  totalConnections: 0,
  activeConnections: 0,
  messagesReceived: 0,
  messagesSent: 0,
  errors: 0,
  reconnections: 0
};

// Expose metrics endpoint
app.get('/metrics', (req, res) => {
  res.json({
    ...metrics,
    instanceId: process.env.K_REVISION,
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});

// Update metrics
ws.on('connection', (socket) => {
  metrics.totalConnections++;
  metrics.activeConnections++;

  socket.on('close', () => {
    metrics.activeConnections--;
  });

  socket.on('message', () => {
    metrics.messagesReceived++;
  });

  socket.on('error', () => {
    metrics.errors++;
  });
});
```

**Cloud Monitoring Integration:**

```javascript
const { Logging } = require('@google-cloud/logging');
const logging = new Logging();
const log = logging.log('websocket-service');

function logMetric(metricName, value, labels = {}) {
  const entry = log.entry({
    resource: {
      type: 'cloud_run_revision',
      labels: {
        service_name: process.env.K_SERVICE,
        revision_name: process.env.K_REVISION,
        location: process.env.REGION
      }
    },
    severity: 'INFO',
    labels
  }, {
    metric: metricName,
    value,
    timestamp: new Date().toISOString()
  });

  log.write(entry);
}

// Log metrics every 60 seconds
setInterval(() => {
  logMetric('websocket_active_connections', metrics.activeConnections);
  logMetric('websocket_total_connections', metrics.totalConnections);
  logMetric('websocket_messages_sent', metrics.messagesSent);
}, 60000);
```

---

### 5. Optimize for Cold Starts

**Problem:** Cold starts impact initial WebSocket connection latency.

**Solution 1: Minimum Instances**

```bash
# Keep at least 1 instance warm
gcloud run services update websocket-service --min-instances=1
```

**Solution 2: Lazy Loading**

```javascript
// Load heavy dependencies lazily
let redisClient;

async function getRedisClient() {
  if (!redisClient) {
    const { createClient } = require('redis');
    redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
  }
  return redisClient;
}

// Initialize only when needed
ws.on('connection', async (socket) => {
  const redis = await getRedisClient();
  // Use redis...
});
```

**Solution 3: Connection Pooling**

```javascript
const { createClient } = require('redis');

// Create connection pool
const pool = {
  pub: null,
  sub: null
};

async function initializePool() {
  if (!pool.pub) {
    pool.pub = createClient({ url: process.env.REDIS_URL });
    pool.sub = pool.pub.duplicate();
    await Promise.all([pool.pub.connect(), pool.sub.connect()]);
  }
  return pool;
}
```

---

### 6. Handle Graceful Shutdown

**Why:** Cloud Run sends SIGTERM before shutting down containers.

**Implementation:**

```javascript
// Track active connections
const activeConnections = new Set();

wss.on('connection', (ws) => {
  activeConnections.add(ws);

  ws.on('close', () => {
    activeConnections.delete(ws);
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing gracefully...');

  // Stop accepting new connections
  wss.close(() => {
    console.log('WebSocket server closed to new connections');
  });

  // Notify clients
  activeConnections.forEach((ws) => {
    ws.send(JSON.stringify({
      type: 'shutdown',
      message: 'Server shutting down, please reconnect',
      reconnect: true
    }));
  });

  // Wait for messages to be sent
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Close all connections
  activeConnections.forEach((ws) => {
    ws.close(1001, 'Server shutting down');
  });

  // Close Redis connections
  await pubClient.quit();
  await subClient.quit();

  // Exit
  process.exit(0);
});
```

---

### 7. Security Best Practices

**CORS Configuration:**

```javascript
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];

      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true
  }
});
```

**Authentication:**

```javascript
io.use((socket, next) => {
  const token = socket.handshake.auth.token;

  if (!token) {
    return next(new Error('Authentication error'));
  }

  // Verify token (JWT, Firebase Auth, etc.)
  verifyToken(token)
    .then(user => {
      socket.user = user;
      next();
    })
    .catch(err => {
      next(new Error('Authentication error'));
    });
});
```

**Rate Limiting:**

```javascript
const rateLimits = new Map();

ws.on('message', async (data) => {
  const clientId = getClientId(ws);
  const now = Date.now();

  // Get or initialize rate limit data
  if (!rateLimits.has(clientId)) {
    rateLimits.set(clientId, { count: 0, resetAt: now + 60000 });
  }

  const limit = rateLimits.get(clientId);

  // Reset if time window passed
  if (now > limit.resetAt) {
    limit.count = 0;
    limit.resetAt = now + 60000;
  }

  // Check limit (e.g., 100 messages per minute)
  if (limit.count >= 100) {
    ws.send(JSON.stringify({
      type: 'error',
      message: 'Rate limit exceeded'
    }));
    return;
  }

  limit.count++;

  // Process message
  await handleMessage(data);
});
```

---

## Pricing & Cost Analysis

### Billing Model

**Instance-Based Billing:**
> "A Cloud Run instance that has any open WebSocket connection is considered active, so CPU is allocated and the service is billed."

This means you're billed for:
- **CPU allocation** (vCPU-seconds)
- **Memory allocation** (GB-seconds)
- **Network egress** (outbound data)
- **Request count** (minimal for WebSockets)

### Pricing Calculator (US Region)

**Base Costs (as of December 2024):**
- **CPU:** $0.00002400 per vCPU-second
- **Memory:** $0.00000250 per GB-second
- **Requests:** $0.40 per million requests
- **Network Egress:** $0.12 per GB

**Example Configuration:**
- 2 vCPU
- 2 GB memory
- 250 concurrent connections per container
- 1,000 containers max
- 100% utilization (always active)

**Monthly Cost Calculation:**

```
Hours per month: 730 hours
Seconds per month: 2,628,000 seconds

Per Container Per Month:
- CPU: 2 vCPU × 2,628,000 sec × $0.000024 = $126.14
- Memory: 2 GB × 2,628,000 sec × $0.0000025 = $13.14
- Total per container: $139.28

For 1,000 containers:
- Monthly cost: $139,280

For 250,000 concurrent connections:
- Cost per connection: ~$0.557/month
```

**Additional Costs:**
- **Memorystore (Redis):** ~$50-200/month (Basic tier, 1-5 GB)
- **VPC Connector:** ~$0.10/hour = ~$73/month
- **Network Egress:** Varies by traffic volume

**Total Estimated Cost for 250k Connections:**
- **Cloud Run:** ~$139,000/month
- **Infrastructure:** ~$300/month
- **Grand Total:** ~$139,300/month

---

### Cost Optimization Strategies

#### 1. Right-Size Containers

```bash
# Start small
gcloud run services update websocket-service \
  --cpu=1 \
  --memory=1Gi

# Monitor and scale up if needed
```

**Impact:**
- 1 vCPU + 1 GB = ~$69/month per container
- 50% cost reduction compared to 2 vCPU + 2 GB

#### 2. Optimize Concurrency

```bash
# Increase concurrency to reduce container count
gcloud run services update websocket-service --concurrency=1000
```

**Impact:**
- 1,000 connections per container vs 250
- 75% fewer containers needed
- 75% cost reduction

#### 3. Use Spot/Preemptible Instances (GKE Alternative)

If costs are prohibitive, migrate to GKE with preemptible nodes:

```bash
# GKE with preemptible nodes: ~$0.01 per hour per vCPU
# 80% cheaper than Cloud Run
```

#### 4. Implement Connection Limits

```javascript
const MAX_CONNECTIONS = 10000;

wss.on('connection', (ws) => {
  if (wss.clients.size >= MAX_CONNECTIONS) {
    ws.close(1008, 'Server at capacity');
    return;
  }

  // Accept connection
});
```

---

### When Cloud Run Makes Financial Sense

**Use Cloud Run for WebSockets if:**
- ✅ <10,000 concurrent connections
- ✅ Unpredictable, bursty traffic
- ✅ Short-term events (launches, campaigns)
- ✅ Rapid prototyping and testing
- ✅ Small engineering team (no DevOps)

**Migrate to GKE/Compute Engine if:**
- ❌ >50,000 concurrent connections
- ❌ Predictable, steady traffic
- ❌ Long-term production deployment
- ❌ Cost is a primary concern
- ❌ Need connections >60 minutes

---

## Alternatives Comparison

### Cloud Run vs App Engine vs GKE

| Feature | Cloud Run | App Engine Flex | GKE |
|---------|-----------|-----------------|-----|
| **WebSocket Support** | ✅ Yes (60 min max) | ✅ Yes (no timeout) | ✅ Yes (no timeout) |
| **Session Affinity** | ⚠️ Best effort | ✅ Yes | ✅ Yes (configurable) |
| **Scaling** | Automatic (0-1000) | Automatic (min 1) | Manual/Autoscaling |
| **Cold Starts** | Yes (~1-3 seconds) | Minimal | None (always running) |
| **Billing** | Per-second active | Per-hour (always running) | Per-hour (always running) |
| **Cost at Scale** | 💰💰💰 Very High | 💰💰 High | 💰 Low-Medium |
| **Management** | Zero | Minimal | Full control required |
| **Best For** | <10k connections, bursts | Traditional web apps | >50k connections, control |

### Detailed Comparison

#### **Cloud Run**
- **Pros:** Zero management, auto-scaling, fast deployments
- **Cons:** 60-minute timeout, expensive at scale, best-effort affinity
- **Best Use Case:** Small to medium scale, unpredictable traffic

#### **App Engine Flexible**
- **Pros:** No timeout limits, better for traditional apps
- **Cons:** Always running (minimum 1 instance), more expensive than VMs
- **Best Use Case:** Traditional web applications with some WebSocket needs

#### **GKE (Google Kubernetes Engine)**
- **Pros:** Full control, no timeouts, cost-effective at scale, true session affinity
- **Cons:** Requires Kubernetes knowledge, more management overhead
- **Best Use Case:** Large scale (>50k connections), long-lived connections

**Real-World Advice:**
> "It is a steep price and it might be a better fit for loads that don't need to run as many instances, or for short-term scaling needs like an unanticipated launch/marketing event. In the long term, as your load becomes more predictable, it makes more sense to move to VM-based compute (such as GCE or GKE) as several mid-size virtual machines can handle the same load, potentially 50x cheaper."

---

## Production Examples

### Google's Official Chat Server Tutorial

Google provides an official tutorial demonstrating WebSocket chat service on Cloud Run:

**Architecture:**
- Node.js + Socket.io
- Memorystore for Redis (Pub/Sub)
- VPC Connector
- Session affinity enabled

**Key Features:**
- Multi-room support
- Real-time message synchronization
- User presence tracking
- Automatic reconnection

**Demonstrated Scale:**
> "This demonstrates how to use WebSockets support to build a fleet of serverless containers that make up a chatroom server that can scale to 250,000 concurrent clients."

**Links:**
- Tutorial: https://cloud.google.com/run/docs/tutorials/websockets
- Blog: https://ahmet.im/blog/cloud-run-chat-server/

---

### Production Lessons Learned

#### Case Study: Productivity/Calendar App

A production deployment shared their experience:

**Initial Setup:**
- Monolithic Cloud Run service
- Small WebSocket cluster for beta feature
- Worked well for <1,000 users

**Challenges at Scale:**
> "But the question kept coming up — what would happen when they launched to 10,000 users? 20,000? 40,000? When would it break? It turns out, there's a hard limit — and a steep price to pay as well. A single user could easily have 10 websocket connections at any given time (1 / tab)."

**Decision:**
> "They ultimately decided to launch a dedicated Kubernetes cluster for websockets."

**Lesson:**
- Cloud Run works for initial launch and validation
- Plan migration to GKE before hitting 10k+ concurrent users
- Budget accordingly for growth

---

### Performance Benchmarks

**Connection Capacity:**
- **Per Container:** Up to 1,000 concurrent connections
- **Per Service:** Up to 1,000 containers = 1 million theoretical connections
- **Practical Limit:** ~250,000 connections (due to cost and timeout constraints)

**Latency:**
- **Connection Establishment:** 100-500ms (warm instance), 1-3s (cold start)
- **Message Latency:** 10-50ms (intra-instance), 50-200ms (inter-instance via Redis)
- **Reconnection Time:** 1-5 seconds (with proper client retry logic)

**Message Throughput:**
- **Per Connection:** 100-1,000 messages/second
- **Per Container:** 10,000-50,000 messages/second
- **Bottleneck:** Usually Redis Pub/Sub, not Cloud Run

---

## Troubleshooting Common Issues

### Issue 1: Connections Closing After 5 Minutes

**Symptom:** WebSocket connections terminate exactly at 5 minutes.

**Cause:** Default timeout is 5 minutes.

**Solution:**
```bash
gcloud run services update websocket-service --timeout=3600
```

---

### Issue 2: Messages Not Syncing Across Instances

**Symptom:** Users connected to different instances see different data.

**Cause:** No Redis Pub/Sub or shared state mechanism.

**Solution:** Implement Redis Pub/Sub as shown in the architecture section.

---

### Issue 3: High Connection Drop Rate

**Symptom:** Many connections disconnecting unexpectedly.

**Cause:** No heartbeat mechanism to detect dead connections.

**Solution:** Implement ping/pong heartbeat every 20-30 seconds.

---

### Issue 4: Expensive Bills

**Symptom:** Cloud Run bills are much higher than expected.

**Cause:** Containers staying active due to open WebSocket connections.

**Solution:**
1. Increase concurrency to reduce container count
2. Monitor and right-size CPU/memory
3. Consider migrating to GKE if >50k connections

---

### Issue 5: Cold Start Latency

**Symptom:** First connections take several seconds to establish.

**Cause:** Cloud Run cold starts.

**Solution:**
```bash
# Set minimum instances
gcloud run services update websocket-service --min-instances=1
```

**Trade-off:** Pay for 1 instance 24/7, but eliminate cold starts.

---

## Decision Framework

### Should You Use Cloud Run for WebSockets?

Use this flowchart:

```
Start
  ↓
Do you need connections > 60 minutes?
  ↓ YES → Use GKE or Compute Engine
  ↓ NO
  ↓
Do you expect > 50,000 concurrent connections?
  ↓ YES → Use GKE (cost-effective at scale)
  ↓ NO
  ↓
Is your traffic unpredictable/bursty?
  ↓ YES → Use Cloud Run ✅
  ↓ NO
  ↓
Is your traffic predictable and steady?
  ↓ YES → Use GKE (cheaper long-term)
  ↓ NO
  ↓
Do you have Kubernetes expertise?
  ↓ YES → Consider GKE
  ↓ NO → Use Cloud Run ✅
  ↓
Is budget a primary concern?
  ↓ YES → Use GKE
  ↓ NO → Use Cloud Run ✅
```

---

## Quick Start Checklist

### For New WebSocket Projects on Cloud Run

- [ ] **Architecture Decision**
  - [ ] Confirm <50k concurrent connections expected
  - [ ] Confirm 60-minute timeout is acceptable
  - [ ] Budget approved for Cloud Run costs

- [ ] **Infrastructure Setup**
  - [ ] Create Memorystore for Redis instance
  - [ ] Create VPC Connector
  - [ ] Configure networking and firewall rules

- [ ] **Application Development**
  - [ ] Choose framework (Socket.io, Hono, native ws)
  - [ ] Implement Redis Pub/Sub for state synchronization
  - [ ] Add client reconnection logic
  - [ ] Implement heartbeat/ping-pong mechanism
  - [ ] Add authentication and authorization
  - [ ] Add rate limiting

- [ ] **Testing**
  - [ ] Test connection establishment
  - [ ] Test reconnection scenarios
  - [ ] Load test with expected concurrent connections
  - [ ] Test cross-instance message delivery
  - [ ] Test graceful shutdown

- [ ] **Deployment Configuration**
  - [ ] Set timeout to 3600 seconds
  - [ ] Set concurrency to 1000
  - [ ] Configure min/max instances appropriately
  - [ ] Enable session affinity
  - [ ] Set environment variables (Redis host, etc.)

- [ ] **Monitoring Setup**
  - [ ] Configure Cloud Logging
  - [ ] Set up metrics tracking
  - [ ] Create alerts for errors and capacity
  - [ ] Monitor costs

- [ ] **Production Readiness**
  - [ ] Implement graceful shutdown
  - [ ] Add health check endpoints
  - [ ] Document deployment process
  - [ ] Create runbook for common issues
  - [ ] Plan scaling and migration strategy

---

## Summary

### Key Takeaways

1. **Cloud Run supports WebSockets natively** - No special configuration required
2. **60-minute maximum timeout** - Not suitable for indefinite connections
3. **Best-effort session affinity** - Must use Redis for shared state
4. **Expensive at scale** - Plan to migrate to GKE beyond 50k connections
5. **Excellent for prototyping** - Zero infrastructure management
6. **Requires reconnection logic** - Clients must handle timeout gracefully

### When to Use Cloud Run for WebSockets

**Ideal Scenarios:**
- Early-stage products validating WebSocket features
- Short-term events or launches with unpredictable traffic
- Applications with <10,000 concurrent connections
- Teams without Kubernetes expertise
- Prototypes and MVPs

**Not Recommended:**
- Long-lived connections (>60 minutes required)
- High-scale production (>50,000 concurrent connections)
- Cost-sensitive applications with predictable traffic
- Gaming servers or streaming platforms
- Real-time collaboration tools with >100k users

### Migration Path

**Recommended Approach:**

1. **Start:** Cloud Run (0-10k connections)
   - Fast deployment
   - Validate product-market fit
   - Learn traffic patterns

2. **Grow:** Cloud Run + Optimization (10k-50k connections)
   - Increase concurrency
   - Right-size containers
   - Monitor costs closely

3. **Scale:** Migrate to GKE (>50k connections)
   - Set up Kubernetes cluster
   - Implement load balancing
   - Reduce costs by 50-80%

---

## Additional Resources

### Official Documentation
- [Cloud Run WebSockets Documentation](https://cloud.google.com/run/docs/triggering/websockets)
- [WebSocket Chat Service Tutorial](https://cloud.google.com/run/docs/tutorials/websockets)
- [Cloud Run Pricing](https://cloud.google.com/run/pricing)
- [Session Affinity Configuration](https://cloud.google.com/run/docs/configuring/session-affinity)

### Community Resources
- [Building a High-Scale Chat Server on Cloud Run](https://ahmet.im/blog/cloud-run-chat-server/)
- [Hono WebSocket Documentation](https://hono.dev/docs/helpers/websocket)
- [Socket.io Documentation](https://socket.io/docs/)

### Libraries & Tools
- **Socket.io:** https://socket.io
- **reconnecting-websocket:** https://github.com/pladaria/reconnecting-websocket
- **ws (WebSocket library):** https://github.com/websockets/ws
- **Hono:** https://hono.dev
- **@hono/node-ws:** https://github.com/honojs/middleware/tree/main/packages/node-ws

---

## Sources

### Primary Documentation
- [Using WebSockets | Cloud Run | Google Cloud](https://cloud.google.com/run/docs/triggering/websockets)
- [Building a WebSocket Chat service for Cloud Run tutorial | Google Cloud](https://cloud.google.com/run/docs/tutorials/websockets)
- [Set session affinity for services | Cloud Run | Google Cloud](https://cloud.google.com/run/docs/configuring/session-affinity)
- [Configure request timeout for services | Cloud Run | Google Cloud](https://docs.cloud.google.com/run/docs/configuring/request-timeout)

### Pricing & Billing
- [Cloud Run pricing | Google Cloud](https://cloud.google.com/run/pricing)
- [Google Cloud Run Pricing in 2025: A Comprehensive Guide](https://cloudchipr.com/blog/cloud-run-pricing)
- [Billing settings for services | Cloud Run | Google Cloud](https://cloud.google.com/run/docs/configuring/billing-settings)

### Technical Guides
- [Building a high-scale chat server on Cloud Run](https://ahmet.im/blog/cloud-run-chat-server/)
- [HTTP, gRPC, and websocket on Google Cloud Run](https://hodo.dev/posts/post-41-gcp-cloudrun-grpc-http-ws/)
- [Google Cloud Serverless Platform Highlights Series — Episode 9: Cloud Run Websockets Triggering | Medium](https://medium.com/@yuhuayang_25851/google-cloud-serverless-platform-highlights-series-episode-9-cloud-run-websockets-triggering-6492cc7d01bf)

### Framework Documentation
- [Google Cloud Run - Hono](https://hono.dev/docs/getting-started/google-cloud-run)
- [WebSocket Helper - Hono](https://hono.dev/docs/helpers/websocket)
- [Build a Blazing Fast API in Minutes with Hono and Cloud Run | Medium](https://medium.com/google-cloud/build-a-blazing-fast-api-in-minutes-with-hono-and-cloud-run-d3548cba99a0)

### Best Practices
- [Node.js and Websockets best practices checklist | Voodoo Engineering](https://medium.com/voodoo-engineering/websockets-on-production-with-node-js-bdc82d07bb9f)
- [Secure WebSocket Implementation: Best Practices for Real-Time Communication in 2024](https://jsschools.com/web_dev/secure-websocket-implementation-best-practices-fo/)
- [Understanding Ping Pong Frame WebSocket: Protocol, Implementation & Real-World Use (2025) - VideoSDK](https://www.videosdk.live/developer-hub/websocket/ping-pong-frame-websocket)

### Comparisons & Analysis
- [Never run websockets on Google Cloud Run! | Medium](https://c5r.medium.com/never-run-websockets-on-google-cloud-run-a7e82812a312)
- [Google App Engine in 2025: Serverless Simplicity vs Cloud Run and GKE | Medium](https://medium.com/google-cloud/google-app-engine-in-2025-serverless-simplicity-vs-cloud-run-and-gke-d46f485cf908)
- [Choosing Between GKE and Cloud Run | Medium](https://medium.com/google-cloud/choosing-between-gke-and-cloud-run-46f57b87035c)
- [When to use GKE vs. Cloud Run for containers | Google Cloud Blog](https://cloud.google.com/blog/products/containers-kubernetes/when-to-use-google-kubernetes-engine-vs-cloud-run-for-containers)

### Community Discussions
- [Best way to host a websocket server | Google Cloud Dev](https://groups.google.com/g/google-cloud-dev/c/PjY-qxXs0jg)
- [FastAPI websockets Deployment on GCP Cloud Run](https://github.com/fastapi/fastapi/discussions/12049)
- [Cloud Run WebSocket service scaling for no apparent reason](https://discuss.google.dev/t/cloud-run-websocket-service-scaling-for-no-apparent-reason/188686)

---

**Document Version:** 1.0
**Last Updated:** December 23, 2024
**Maintained By:** Medical Spa Platform Team
