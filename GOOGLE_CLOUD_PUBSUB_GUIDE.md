# Google Cloud Pub/Sub Guide for Real-Time Event Streaming (2024-2025)

## Table of Contents
1. [Overview](#overview)
2. [Core Features](#core-features)
3. [Pricing](#pricing)
4. [Node.js Integration](#nodejs-integration)
5. [Real-Time Use Cases](#real-time-use-cases)
6. [Pub/Sub vs Firebase](#pubsub-vs-firebase)
7. [Implementation Guide: Notification System](#implementation-guide-notification-system)
8. [Best Practices](#best-practices)
9. [Resources](#resources)

---

## Overview

**Google Cloud Pub/Sub** is a fully-managed, asynchronous messaging service that decouples services producing messages from services processing those messages. It's built on the core Google infrastructure that powers products like Ads, Search, and Gmail, processing over **500 million messages per second** (1TB/s of data).

### Key Characteristics
- **Latency**: Typically ~100 milliseconds
- **Scalability**: Horizontal scaling without partitions
- **Global**: Runs in all Google Cloud regions
- **Proven**: Over a decade of use in Google products
- **Reliability**: Designed for service-to-service communication

---

## Core Features

### 1. Event-Driven Architecture

Pub/Sub supports an "enterprise event bus" pattern where:
- **Publishers** broadcast events to topics without regard to how/when they're processed
- **Subscribers** react to events asynchronously
- **Decoupling** enables independent scaling and development

**Model Comparison:**
- **Message Queue**: Publisher → Queue → Single subscriber per queue
- **Pub/Sub**: Publisher → Topic → Multiple subscribers

### 2. Subscription Types

#### Pull Subscriptions
- **Control**: Subscriber client initiates requests to retrieve messages
- **APIs**:
  - `Pull` - Unary RPC (request/response)
  - `StreamingPull` - Persistent bidirectional connection
- **Best For**: High-volume consumption, custom processing logic, GKE deployments
- **Features**: Lease management, ordered delivery, exactly-once delivery, flow control

#### Push Subscriptions
- **Control**: Pub/Sub server initiates requests to subscriber endpoints
- **Best For**: Serverless architectures (Cloud Run, Cloud Functions, GKE)
- **Requirements**: HTTPS endpoints only
- **Benefits**: Minimal Pub/Sub-specific dependencies, auto-scaling friendly

#### BigQuery Subscriptions
- **Direct writes** to BigQuery tables
- **Use Case**: Analytical workloads, long-term storage

#### Cloud Storage Subscriptions
- **Direct writes** to Cloud Storage buckets
- **Use Case**: Cost-effective storage of large message volumes

### 3. Message Ordering

Preserves chronological order of events:
- Messages published with the same ordering key are delivered in order
- Publisher must publish in the same region
- Subscribers can connect from any region while maintaining order
- **Use Cases**: Database change capture, user session tracking, streaming applications

**Important**: Order might not be preserved when messages are written to dead-letter topics.

### 4. Dead Letter Queues (DLQ)

Manages undeliverable messages:
- **Configuration**: Maximum delivery attempts (5-100)
- **Behavior**: After max attempts, message forwarded to dead-letter topic
- **Permissions Required**:
  - Pub/Sub service account needs **Publisher** role on DLQ topic
  - Pub/Sub service account needs **Subscriber** role on subscription

**Use Case**: Prevent indefinite message holding, enable troubleshooting

### 5. Exactly-Once Delivery

- **Guarantee**: Messages delivered exactly once (when enabled)
- **Default**: At-least-once delivery
- **Configuration**: Set per subscription
- **Client Support**: Available in high-level client libraries

---

## Pricing

### Pricing Model (2025)

| Component | Cost | Notes |
|-----------|------|-------|
| **Throughput** | ~$15/TB/month | After free tier |
| **Per-Message** | ~$0.40/million messages | |
| **Free Tier** | 10 GB/month | ~10.74 GB in decimal |
| **Storage (first 24h)** | Free | All configurations |
| **Storage (>24h)** | $0.10-$0.21/GiB-month | Topic retention, subscriptions, snapshots |

### Cost Considerations

**Low Cost for:**
- Development environments
- Small production workloads (within free tier)
- Event-driven microservices

**Higher Cost for:**
- Very high message volumes (millions/day)
- Long message retention periods
- Large message payloads

**Important Note**: Pub/Sub Lite was deprecated for new customers after September 24, 2024, and will be discontinued in March 2026.

### Free Tier Benefits
- 10 GB of messages/month covers substantial development and small production workloads
- First 24 hours of storage is free across all configurations
- No charge for topics or subscriptions, only usage

---

## Node.js Integration

### Installation

```bash
npm install @google-cloud/pubsub
```

### Authentication Setup

1. Create a service account in Google Cloud Console
2. Download service account key (JSON)
3. Set environment variable:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
```

### Basic Publisher Example

```javascript
const { PubSub } = require('@google-cloud/pubsub');

// Initialize client
const pubsub = new PubSub({
  projectId: 'your-project-id'
});

async function publishMessage(topicName, data) {
  const topic = pubsub.topic(topicName);

  // Message data must be a Buffer
  const messageBuffer = Buffer.from(JSON.stringify(data));

  try {
    const messageId = await topic.publish(messageBuffer);
    console.log(`Message ${messageId} published.`);
    return messageId;
  } catch (error) {
    console.error(`Error publishing message: ${error}`);
    throw error;
  }
}

// Usage
publishMessage('user-notifications', {
  userId: '12345',
  event: 'registration',
  timestamp: Date.now()
});
```

### Basic Pull Subscriber Example

```javascript
const { PubSub } = require('@google-cloud/pubsub');

const pubsub = new PubSub({
  projectId: 'your-project-id'
});

async function subscribeMessages(subscriptionName) {
  const subscription = pubsub.subscription(subscriptionName);

  // Message handler
  const messageHandler = (message) => {
    console.log(`Received message: ${message.id}`);
    console.log(`Data: ${message.data.toString()}`);
    console.log(`Attributes: ${JSON.stringify(message.attributes)}`);

    // Acknowledge the message
    message.ack();
  };

  // Error handler
  const errorHandler = (error) => {
    console.error(`Error receiving message: ${error}`);
  };

  // Listen for messages
  subscription.on('message', messageHandler);
  subscription.on('error', errorHandler);

  console.log(`Listening for messages on ${subscriptionName}...`);
}

// Usage
subscribeMessages('user-notifications-sub');
```

### Push Subscriber Example (Cloud Run/Functions)

```javascript
// Express.js endpoint for push subscriptions
const express = require('express');
const app = express();

app.use(express.json());

app.post('/pubsub/push', (req, res) => {
  // Pub/Sub sends message in request body
  const message = req.body.message;

  if (!message) {
    res.status(400).send('No Pub/Sub message received');
    return;
  }

  // Decode base64 message data
  const data = Buffer.from(message.data, 'base64').toString();
  console.log(`Received message: ${data}`);

  // Process the message
  try {
    const payload = JSON.parse(data);
    // Handle your notification logic here
    processNotification(payload);

    res.status(200).send('Message processed');
  } catch (error) {
    console.error(`Error processing message: ${error}`);
    res.status(500).send('Error processing message');
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

### Cloud Run Integration

**Deployment Steps:**

1. **Build container image:**
```bash
gcloud builds submit --tag gcr.io/PROJECT-ID/pubsub-handler
```

2. **Deploy to Cloud Run:**
```bash
gcloud run deploy pubsub-handler \
  --image gcr.io/PROJECT-ID/pubsub-handler \
  --no-allow-unauthenticated \
  --base-image nodejs22
```

3. **Create push subscription:**
```bash
gcloud pubsub subscriptions create SUBSCRIPTION-NAME \
  --topic TOPIC-NAME \
  --push-endpoint https://CLOUD-RUN-URL/pubsub/push \
  --push-auth-service-account SERVICE-ACCOUNT@PROJECT.iam.gserviceaccount.com
```

### Cloud Run Functions (2nd Gen)

Cloud Functions has been renamed to **Cloud Run Functions** and now runs on the Cloud Run platform.

**Supported Runtimes:**
- Node.js 22 (GA)
- Node.js 24 (Current, LTS in October 2025)

**Pub/Sub Trigger Example:**

```javascript
const functions = require('@google-cloud/functions-framework');

// Register a Pub/Sub event handler
functions.cloudEvent('notificationHandler', (cloudEvent) => {
  // Decode the Pub/Sub message
  const data = cloudEvent.data.message.data
    ? Buffer.from(cloudEvent.data.message.data, 'base64').toString()
    : '{}';

  console.log(`Received notification: ${data}`);

  const payload = JSON.parse(data);

  // Process notification
  processNotification(payload);
});
```

**Deploy:**
```bash
gcloud functions deploy notificationHandler \
  --gen2 \
  --runtime nodejs22 \
  --trigger-topic TOPIC-NAME \
  --base-image nodejs22
```

### Advanced Features

#### Message Ordering

```javascript
// Publisher with ordering
async function publishOrderedMessage(topicName, data, orderingKey) {
  const topic = pubsub.topic(topicName, {
    enableMessageOrdering: true
  });

  const messageBuffer = Buffer.from(JSON.stringify(data));

  const messageId = await topic.publishMessage({
    data: messageBuffer,
    orderingKey: orderingKey
  });

  return messageId;
}

// Usage: Messages with same orderingKey will be delivered in order
await publishOrderedMessage('events', { action: 'create' }, 'user-12345');
await publishOrderedMessage('events', { action: 'update' }, 'user-12345');
```

#### Exactly-Once Delivery

```javascript
// Subscriber with exactly-once delivery
async function subscribeExactlyOnce(subscriptionName) {
  const subscription = pubsub.subscription(subscriptionName, {
    enableExactlyOnceDelivery: true
  });

  subscription.on('message', (message) => {
    console.log(`Processing message: ${message.id}`);
    // Process message - guaranteed to be delivered exactly once
    message.ack();
  });
}
```

#### Dead Letter Queue Setup

```javascript
async function createSubscriptionWithDLQ(subscriptionName, topicName, dlqTopicName) {
  const subscription = await pubsub.createSubscription(topicName, subscriptionName, {
    deadLetterPolicy: {
      deadLetterTopic: `projects/${projectId}/topics/${dlqTopicName}`,
      maxDeliveryAttempts: 10
    }
  });

  console.log(`Subscription ${subscriptionName} created with DLQ.`);
  return subscription;
}
```

---

## Real-Time Use Cases

### Can Pub/Sub Power Real-Time UI Updates?

**Short Answer**: Not directly, but yes through bridge patterns.

**Important Note**: Pub/Sub is intended for **service-to-service communication**, NOT for end-user or IoT clients.

### WebSocket Bridge Pattern

Pub/Sub can power real-time UI updates by bridging to WebSockets:

```
User Browser (WebSocket)
    ↕
Cloud Run Service (WebSocket Server)
    ↕
Pub/Sub (Message Stream)
    ↕
Backend Services
```

**Implementation Example:**

```javascript
const WebSocket = require('ws');
const { PubSub } = require('@google-cloud/pubsub');

const wss = new WebSocket.Server({ port: 8080 });
const pubsub = new PubSub();
const subscription = pubsub.subscription('real-time-updates');

// Store active WebSocket connections
const connections = new Map();

// Handle WebSocket connections
wss.on('connection', (ws, req) => {
  const userId = getUserIdFromRequest(req);
  connections.set(userId, ws);

  ws.on('close', () => {
    connections.delete(userId);
  });
});

// Subscribe to Pub/Sub messages
subscription.on('message', (message) => {
  const data = JSON.parse(message.data.toString());

  // Route message to appropriate WebSocket connection
  const ws = connections.get(data.userId);
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  }

  message.ack();
});
```

**Deployment Considerations:**

For Cloud Run WebSocket services:
- Use external message queues (Pub/Sub, Redis, Firestore) to synchronize data between instances
- Handle autoscaling and stateless nature of Cloud Run
- Consider concurrency limits and request timeouts

### Chat/Notification Systems

**Architecture Pattern:**

```
Mobile/Web App
    → API (Cloud Run)
        → Pub/Sub Topic ("chat-messages")
            → Subscription 1 (WebSocket Bridge) → Real-time updates
            → Subscription 2 (Email Service) → Email notifications
            → Subscription 3 (Analytics) → Message analytics
```

**Characteristics:**
- **Asynchronous**: Near-real-time delivery (not guaranteed instant)
- **Scalable**: Handle millions of messages
- **Fanout**: One message to multiple subscribers
- **Reliable**: Retry logic and DLQ for failures

### Common Use Cases

1. **Parallel Processing**: Distribute tasks among workers (image processing, AI model evaluation)
2. **Data Streaming**: IoT devices, application events, real-time analytics
3. **Event-Driven ETL**: Data pipeline triggers
4. **Microservices Communication**: Decouple service dependencies
5. **Notification Systems**: Multi-channel notifications (email, SMS, push)

---

## Pub/Sub vs Firebase

### When to Use Google Cloud Pub/Sub

**Use Pub/Sub for:**
- **Service-to-service communication** (backend to backend)
- **Event-driven architectures** with microservices
- **High-volume messaging** (millions of messages/second)
- **Streaming analytics** and data integration pipelines
- **Asynchronous processing** with latency ~100ms
- **Message queuing** for task parallelization
- **Data pipeline orchestration**

**Characteristics:**
- Messaging service (not a database)
- Binary/text messages (no persistent storage)
- No built-in real-time sync
- Requires separate authentication
- Focused on reliability and scale

### When to Use Firebase

**Use Firebase for:**
- **Client-server communication** (mobile/web app to service)
- **Real-time data synchronization** between clients
- **Rapid development** of MVPs and smaller applications
- **Chat apps** and collaborative tools
- **User authentication** (built-in providers)
- **Real-time UI updates** (out-of-the-box)

**Characteristics:**
- Comprehensive platform (database, auth, storage, etc.)
- JSON-like data format (Realtime Database/Firestore)
- Built-in real-time synchronization
- Easy authentication and authorization
- Developer-friendly, fast deployment

### Can They Work Together?

**Yes!** They complement each other:

**Example Architecture:**
```
Mobile/Web App
    ↕
Firebase (Client-facing)
    - Real-time Database
    - Authentication
    - Cloud Messaging
    ↕
Cloud Functions (triggered by Firebase events)
    ↕
Pub/Sub (Backend event bus)
    ↕
Backend Services (GCP)
    - Cloud Run
    - BigQuery
    - Cloud Storage
```

**Integration Pattern:**

```javascript
// Firebase Cloud Function triggered by Firestore
exports.onUserCreated = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snap, context) => {
    const userData = snap.data();

    // Publish to Pub/Sub for backend processing
    const pubsub = new PubSub();
    const topic = pubsub.topic('user-events');

    await topic.publishMessage({
      data: Buffer.from(JSON.stringify({
        event: 'user_created',
        userId: context.params.userId,
        ...userData
      }))
    });
  });
```

**Best Practice**: Use Firebase for client-facing real-time features, Pub/Sub for backend event processing and service integration.

---

## Implementation Guide: Notification System

### System Architecture

```
User Registration
    ↓
User Service (Cloud Run)
    → Publish to Pub/Sub ("user-events")
        → Subscription 1: Email Service (push)
        → Subscription 2: SMS Service (push)
        → Subscription 3: Analytics Service (pull)
        → Subscription 4: WebSocket Bridge (pull)
            → Real-time UI updates
```

### Step 1: Project Setup

```bash
# Enable required APIs
gcloud services enable pubsub.googleapis.com
gcloud services enable run.googleapis.com
gcloud services enable cloudbuild.googleapis.com

# Set project
gcloud config set project YOUR-PROJECT-ID
```

### Step 2: Create Topics and Subscriptions

```bash
# Create main topic
gcloud pubsub topics create user-events

# Create dead-letter topic
gcloud pubsub topics create user-events-dlq

# Create email subscription (push)
gcloud pubsub subscriptions create email-notifications \
  --topic user-events \
  --push-endpoint https://email-service-URL/pubsub/push \
  --ack-deadline 60 \
  --dead-letter-topic user-events-dlq \
  --max-delivery-attempts 10

# Create SMS subscription (push)
gcloud pubsub subscriptions create sms-notifications \
  --topic user-events \
  --push-endpoint https://sms-service-URL/pubsub/push \
  --ack-deadline 60 \
  --dead-letter-topic user-events-dlq \
  --max-delivery-attempts 10

# Create analytics subscription (pull)
gcloud pubsub subscriptions create analytics-processing \
  --topic user-events \
  --enable-exactly-once-delivery \
  --dead-letter-topic user-events-dlq \
  --max-delivery-attempts 10
```

### Step 3: User Service (Publisher)

**File: `user-service/index.js`**

```javascript
const express = require('express');
const { PubSub } = require('@google-cloud/pubsub');

const app = express();
app.use(express.json());

const pubsub = new PubSub();
const topic = pubsub.topic('user-events');

// User registration endpoint
app.post('/api/users/register', async (req, res) => {
  try {
    const { email, name, phone } = req.body;

    // Create user in database (mock)
    const user = {
      id: generateUserId(),
      email,
      name,
      phone,
      createdAt: new Date().toISOString()
    };

    // Publish event to Pub/Sub
    const messageId = await topic.publishMessage({
      data: Buffer.from(JSON.stringify({
        event: 'user_registered',
        user: user,
        timestamp: Date.now()
      })),
      attributes: {
        eventType: 'user_registered',
        userId: user.id
      }
    });

    console.log(`Event published: ${messageId}`);

    // Return immediately (don't wait for email/SMS)
    res.status(201).json({
      success: true,
      user: user,
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`User Service listening on port ${PORT}`);
});
```

### Step 4: Email Service (Push Subscriber)

**File: `email-service/index.js`**

```javascript
const express = require('express');
const nodemailer = require('nodemailer');

const app = express();
app.use(express.json());

// Configure email transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Push subscription endpoint
app.post('/pubsub/push', async (req, res) => {
  try {
    const message = req.body.message;

    if (!message) {
      return res.status(400).send('No message received');
    }

    // Decode message
    const data = JSON.parse(
      Buffer.from(message.data, 'base64').toString()
    );

    console.log(`Processing event: ${data.event}`);

    // Handle user registration event
    if (data.event === 'user_registered') {
      await sendWelcomeEmail(data.user);
    }

    res.status(200).send('Message processed');

  } catch (error) {
    console.error('Error processing message:', error);
    // Return 500 to trigger retry
    res.status(500).send('Processing failed');
  }
});

async function sendWelcomeEmail(user) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: 'Welcome to Medical Spa Platform',
    html: `
      <h1>Welcome, ${user.name}!</h1>
      <p>Thank you for registering.</p>
    `
  };

  await transporter.sendMail(mailOptions);
  console.log(`Welcome email sent to ${user.email}`);
}

const PORT = process.env.PORT || 8081;
app.listen(PORT, () => {
  console.log(`Email Service listening on port ${PORT}`);
});
```

### Step 5: Analytics Service (Pull Subscriber)

**File: `analytics-service/index.js`**

```javascript
const { PubSub } = require('@google-cloud/pubsub');
const { BigQuery } = require('@google-cloud/bigquery');

const pubsub = new PubSub();
const bigquery = new BigQuery();

const subscriptionName = 'analytics-processing';
const subscription = pubsub.subscription(subscriptionName);

const datasetId = 'user_analytics';
const tableId = 'user_events';

// Message handler
const messageHandler = async (message) => {
  try {
    const data = JSON.parse(message.data.toString());

    console.log(`Received analytics event: ${data.event}`);

    // Insert into BigQuery
    await bigquery
      .dataset(datasetId)
      .table(tableId)
      .insert([{
        event_type: data.event,
        user_id: data.user.id,
        user_email: data.user.email,
        timestamp: new Date(data.timestamp),
        metadata: JSON.stringify(data.user)
      }]);

    console.log(`Event stored in BigQuery`);

    // Acknowledge message
    message.ack();

  } catch (error) {
    console.error('Error processing analytics:', error);
    // Don't acknowledge - will retry
    message.nack();
  }
};

// Error handler
const errorHandler = (error) => {
  console.error(`Subscription error: ${error}`);
};

// Start listening
subscription.on('message', messageHandler);
subscription.on('error', errorHandler);

console.log(`Analytics Service listening for messages...`);
```

### Step 6: WebSocket Bridge (Pull Subscriber)

**File: `websocket-bridge/index.js`**

```javascript
const WebSocket = require('ws');
const { PubSub } = require('@google-cloud/pubsub');
const http = require('http');

const pubsub = new PubSub();
const subscription = pubsub.subscription('websocket-updates');

// Create HTTP server and WebSocket server
const server = http.createServer();
const wss = new WebSocket.Server({ server });

// Store active connections by user ID
const connections = new Map();

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  // Extract user ID from query params or auth token
  const url = new URL(req.url, 'http://localhost');
  const userId = url.searchParams.get('userId');

  if (!userId) {
    ws.close(1008, 'User ID required');
    return;
  }

  // Store connection
  connections.set(userId, ws);
  console.log(`User ${userId} connected. Total connections: ${connections.size}`);

  // Handle disconnection
  ws.on('close', () => {
    connections.delete(userId);
    console.log(`User ${userId} disconnected. Total connections: ${connections.size}`);
  });

  // Send initial connection success message
  ws.send(JSON.stringify({ type: 'connected', userId }));
});

// Pub/Sub message handler
subscription.on('message', (message) => {
  try {
    const data = JSON.parse(message.data.toString());

    // Route to specific user or broadcast
    if (data.userId) {
      // Send to specific user
      const ws = connections.get(data.userId);
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(data));
        console.log(`Message sent to user ${data.userId}`);
      }
    } else {
      // Broadcast to all connected users
      connections.forEach((ws, userId) => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify(data));
        }
      });
      console.log(`Message broadcasted to ${connections.size} users`);
    }

    message.ack();

  } catch (error) {
    console.error('Error processing message:', error);
    message.nack();
  }
});

subscription.on('error', (error) => {
  console.error('Subscription error:', error);
});

const PORT = process.env.PORT || 8082;
server.listen(PORT, () => {
  console.log(`WebSocket Bridge listening on port ${PORT}`);
});
```

### Step 7: Deploy Services

**Deploy User Service:**
```bash
cd user-service
gcloud run deploy user-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

**Deploy Email Service:**
```bash
cd email-service
gcloud run deploy email-service \
  --source . \
  --platform managed \
  --region us-central1 \
  --no-allow-unauthenticated \
  --set-env-vars EMAIL_USER=your-email@gmail.com,EMAIL_PASS=your-password
```

**Deploy Analytics Service (as container):**
```bash
cd analytics-service
docker build -t gcr.io/PROJECT-ID/analytics-service .
docker push gcr.io/PROJECT-ID/analytics-service

# Run on GKE or Cloud Run
gcloud run deploy analytics-service \
  --image gcr.io/PROJECT-ID/analytics-service \
  --platform managed \
  --region us-central1 \
  --no-allow-unauthenticated
```

**Deploy WebSocket Bridge:**
```bash
cd websocket-bridge
gcloud run deploy websocket-bridge \
  --source . \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --use-http2
```

### Step 8: Update Push Subscriptions

After deploying services, update push endpoints:

```bash
# Update email subscription
gcloud pubsub subscriptions modify-push-config email-notifications \
  --push-endpoint https://email-service-HASH-uc.a.run.app/pubsub/push

# Update SMS subscription
gcloud pubsub subscriptions modify-push-config sms-notifications \
  --push-endpoint https://sms-service-HASH-uc.a.run.app/pubsub/push
```

### Step 9: Test the System

```bash
# Register a user
curl -X POST https://user-service-HASH-uc.a.run.app/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "phone": "+1234567890"
  }'

# Expected flow:
# 1. User service publishes to Pub/Sub (returns immediately)
# 2. Email service receives push notification (sends email)
# 3. SMS service receives push notification (sends SMS)
# 4. Analytics service pulls message (stores in BigQuery)
# 5. WebSocket bridge pulls message (updates connected clients)
```

### Step 10: Monitor and Debug

```bash
# View subscription metrics
gcloud pubsub subscriptions describe email-notifications

# View message backlog
gcloud pubsub subscriptions list

# View topic metrics
gcloud pubsub topics describe user-events

# View logs
gcloud logging read "resource.type=cloud_run_revision AND resource.labels.service_name=email-service" --limit 50

# Dead letter queue monitoring
gcloud pubsub subscriptions pull user-events-dlq --limit=10
```

---

## Best Practices

### 1. Scalability

#### Horizontal Scaling
- **Per-message processing** maximizes parallelism (no partition limits)
- **Auto-scaling**: Pub/Sub handles scaling automatically
- **Multiple subscribers**: Each subscription can scale independently

#### High-Volume Strategies
- **Batch publishing**: Group multiple messages in single publish operation
- **Batch processing**: Consume messages in batches for efficiency
- **Topic partitioning**: Divide high-traffic topics for parallel processing
- **Flow control**: Configure max messages and bytes in client libraries

```javascript
// Batch publishing example
async function publishBatch(topicName, messages) {
  const topic = pubsub.topic(topicName, {
    batching: {
      maxMessages: 100,
      maxMilliseconds: 1000
    }
  });

  const promises = messages.map(msg =>
    topic.publishMessage({
      data: Buffer.from(JSON.stringify(msg))
    })
  );

  await Promise.all(promises);
}
```

### 2. Reliability

#### Message Acknowledgment
- **Pull**: Explicitly call `message.ack()` or `message.nack()`
- **Push**: Return HTTP 200 for success, 4xx/5xx for retry
- **Timeout**: Configure appropriate ack deadlines (10-600 seconds)

#### Dead Letter Queues
- Set `maxDeliveryAttempts` (5-100)
- Monitor DLQ for systemic issues
- Implement alerting on DLQ message count

#### Retry Logic
- **Exponential backoff** built-in for push subscriptions
- **Custom retry**: Implement in pull subscribers
- **Idempotency**: Design handlers to be idempotent

### 3. Security

#### Authentication
- Use service accounts with minimal permissions
- Rotate credentials regularly
- Use Workload Identity for GKE

#### Encryption
- **In-transit**: TLS encryption (automatic)
- **At-rest**: Google-managed or customer-managed encryption keys
- **Message-level**: Encrypt sensitive payloads before publishing

#### IAM Permissions
- Publisher: `pubsub.publisher` role
- Subscriber: `pubsub.subscriber` role
- Viewer: `pubsub.viewer` role (read-only)

### 4. Performance

#### Latency Optimization
- **Regional topics**: Co-locate publishers/subscribers
- **Streaming pull**: Use for lowest latency (vs simple pull)
- **Connection pooling**: Reuse Pub/Sub clients

#### Throughput
- **Parallel subscribers**: Scale subscriber instances
- **Message batching**: Reduce overhead
- **Flow control**: Tune `maxMessages` and `maxBytes`

```javascript
// Flow control example
const subscription = pubsub.subscription('my-sub', {
  flowControl: {
    maxMessages: 100,
    maxBytes: 10 * 1024 * 1024 // 10 MB
  }
});
```

### 5. Cost Optimization

#### Reduce Costs
- **Monitor usage**: Set up billing alerts
- **Message size**: Keep payloads small, use Cloud Storage for large data
- **Retention**: Use short retention periods where possible
- **Free tier**: Leverage 10 GB/month free tier
- **Cleanup**: Delete unused topics and subscriptions

#### Efficient Patterns
- **Fanout**: One publish, multiple subscriptions (no extra cost)
- **Filtering**: Use subscription filters to reduce unnecessary processing
- **Compression**: Compress message payloads

### 6. Monitoring

#### Key Metrics
- **Message publish rate**: Messages/second
- **Subscription backlog**: Unacknowledged messages
- **Oldest unacknowledged message age**: Latency indicator
- **Delivery attempts**: Identify problematic messages

#### Cloud Monitoring
```bash
# Create alert for high backlog
gcloud alpha monitoring policies create \
  --notification-channels=CHANNEL-ID \
  --display-name="High Pub/Sub Backlog" \
  --condition-display-name="Backlog > 1000" \
  --condition-threshold-value=1000 \
  --condition-threshold-duration=300s
```

### 7. Development

#### Local Testing
- **Pub/Sub Emulator**: Test without GCP costs
```bash
gcloud beta emulators pubsub start --project=test-project

# Set environment variable
export PUBSUB_EMULATOR_HOST=localhost:8085
```

#### Error Handling
```javascript
subscription.on('message', async (message) => {
  try {
    await processMessage(message);
    message.ack();
  } catch (error) {
    console.error(`Error processing message ${message.id}:`, error);

    // Retry later (message will be redelivered)
    message.nack();

    // Or acknowledge to prevent redelivery
    // message.ack();
  }
});
```

### 8. Message Design

#### Best Practices
- **Small payloads**: Keep messages under 1 MB
- **JSON format**: Use for structured data
- **Attributes**: Use for routing/filtering metadata
- **Timestamps**: Always include event timestamps
- **Idempotency keys**: Include for duplicate detection

```javascript
// Well-designed message
await topic.publishMessage({
  data: Buffer.from(JSON.stringify({
    event: 'order_placed',
    orderId: '12345',
    timestamp: new Date().toISOString(),
    customerId: 'user-123'
  })),
  attributes: {
    eventType: 'order_placed',
    version: 'v1',
    priority: 'high',
    idempotencyKey: generateUUID()
  }
});
```

---

## Resources

### Official Documentation
- [What is Pub/Sub?](https://cloud.google.com/pubsub/docs/overview)
- [Event-driven architecture with Pub/Sub](https://docs.cloud.google.com/solutions/event-driven-architecture-pubsub)
- [Pub/Sub Pricing](https://cloud.google.com/pubsub/pricing)
- [Node.js Client Library Reference](https://cloud.google.com/nodejs/docs/reference/pubsub/latest)
- [Push Subscriptions](https://cloud.google.com/pubsub/docs/push)
- [Pull Subscriptions](https://cloud.google.com/pubsub/docs/pull)

### Integration Guides
- [Use Pub/Sub with Cloud Run Tutorial](https://cloud.google.com/run/docs/tutorials/pubsub)
- [Cloud Run Functions with Pub/Sub](https://cloud.google.com/functions/docs/tutorials/pubsub)
- [Streaming Pub/Sub Over WebSockets](https://cloud.google.com/pubsub/docs/streaming-cloud-pub-sub-messages-over-websockets)
- [Using WebSockets on Cloud Run](https://docs.cloud.google.com/run/docs/triggering/websockets)

### Advanced Features
- [Dead-letter Topics](https://docs.cloud.google.com/pubsub/docs/dead-letter-topics)
- [Message Ordering](https://docs.cloud.google.com/pubsub/docs/ordering)
- [Subscription Properties](https://docs.cloud.google.com/pubsub/docs/subscription-properties)
- [Best Practices to Publish](https://cloud.google.com/pubsub/docs/publish-best-practices)

### Comparisons
- [Firebase vs Google Cloud Pub/Sub](https://ably.com/compare/firebase-vs-google-pub-sub)
- [Google Cloud Pub/Sub vs Socket.IO](https://ably.com/compare/google-pub-sub-vs-socketio)
- [Pub/Sub Architecture Overview](https://cloud.google.com/pubsub/architecture)

### NPM Packages
- [@google-cloud/pubsub](https://www.npmjs.com/package/@google-cloud/pubsub)
- [GitHub Repository](https://github.com/googleapis/nodejs-pubsub)

### Tutorials & Blogs
- [Getting Started with Cloud Pub/Sub in Node](https://blog.logrocket.com/getting-started-with-cloud-pub-sub-in-node/)
- [Publish and Receive Messages with Google Pub/Sub in Node.js](https://reflectoring.io/google-pub-sub-in-node-js/)
- [Scaling Event-Driven Architectures on Google Cloud](https://www.fabricgroup.com/blog/scaling-event-driven-architectures-on-google-cloud-with-pub-sub-and-containers)

---

## Summary

**Google Cloud Pub/Sub** is a powerful, scalable messaging service ideal for:
- Service-to-service communication
- Event-driven architectures
- High-volume data streaming
- Decoupled microservices

**Key Strengths:**
- Proven reliability (Google-scale)
- Horizontal scaling without partitions
- Flexible subscription types (push/pull)
- Global availability
- Rich feature set (ordering, exactly-once, DLQ)

**Considerations:**
- Not designed for direct client communication (use Firebase for that)
- Requires WebSocket bridge for real-time UI updates
- Cost scales with volume (monitor usage)
- Near-real-time, not instant delivery

**Best Used With:**
- Node.js applications on Cloud Run/Functions
- Microservices architectures
- Data pipelines and analytics
- Event-driven workflows
- Combined with Firebase for client-facing features

For a medical spa platform notification system, Pub/Sub provides a robust, scalable foundation for handling appointment reminders, patient notifications, staff alerts, and system events across multiple channels (email, SMS, in-app).

---

*Generated: December 2024 | Based on Google Cloud documentation and best practices for 2024-2025*
