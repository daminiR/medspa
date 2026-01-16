# Google Cloud Tasks & Cloud Scheduler Implementation Guide
## Background Jobs and Notifications for Medical Spa Platform (2024-2025)

---

## Table of Contents

1. [Overview](#overview)
2. [Google Cloud Tasks](#google-cloud-tasks)
3. [Google Cloud Scheduler](#google-cloud-scheduler)
4. [Comparison: Cloud Tasks vs Cloud Scheduler](#comparison-cloud-tasks-vs-cloud-scheduler)
5. [Use Cases for Medical Spa Platform](#use-cases-for-medical-spa-platform)
6. [Implementation Architecture](#implementation-architecture)
7. [Cloud Tasks vs BullMQ](#cloud-tasks-vs-bullmq)
8. [Cloud Scheduler vs Vercel Cron](#cloud-scheduler-vs-vercel-cron)
9. [Pricing and Quotas](#pricing-and-quotas)
10. [Implementation Guide](#implementation-guide)
11. [Best Practices](#best-practices)
12. [Code Examples](#code-examples)

---

## Overview

Google Cloud provides two primary services for handling background jobs and scheduled tasks:

- **Google Cloud Tasks**: Asynchronous task queue for distributed task execution
- **Google Cloud Scheduler**: Fully managed cron job scheduler

Both services are designed to work together and integrate seamlessly with Cloud Run, Cloud Functions, and other GCP services.

### When to Use Which Service

| Use Case | Recommended Service |
|----------|---------------------|
| **Scheduled recurring jobs** (e.g., daily reports) | Cloud Scheduler |
| **Event-driven tasks** (e.g., user triggers action) | Cloud Tasks |
| **Delayed execution** (e.g., send email in 1 hour) | Cloud Tasks |
| **Batch processing** (e.g., process 1000 records) | Cloud Tasks |
| **Cron jobs** (e.g., every day at 9 AM) | Cloud Scheduler |
| **Rate-limited API calls** | Cloud Tasks |

---

## Google Cloud Tasks

### What is Cloud Tasks?

Cloud Tasks is a fully managed service that allows you to manage the execution, dispatch, and delivery of a large number of distributed tasks. It enables you to separate out pieces of work that can be performed independently, outside of your main application flow, and send them off to be processed asynchronously.

### Key Features

#### 1. Delayed Task Execution
- Schedule tasks to execute at a specific time in the future
- Use `scheduleTime` (Node.js) or `schedule_time` (Python) parameter
- Tasks can be delayed by minutes, hours, or days (up to 31 days)
- System-level delays may occasionally occur (usually a few minutes) but no tasks are lost

#### 2. Rate Limiting
- Control the maximum rate at which tasks are dispatched
- Configure with `--max-dispatches-per-second` flag
- Set concurrent task limits with `--max-concurrent-dispatches`
- **Traffic smoothing**: Dispatches ramp up slowly when queue is newly created or idle
- **System throttling**: Cloud Tasks may temporarily reduce rate to prevent worker overload

#### 3. Retry Policies

Configure retry behavior with the following parameters:

```bash
--max-attempts        # Maximum retry attempts (-1 for unlimited)
--max-retry-duration  # Maximum time for retrying (0 for unlimited)
--min-backoff         # Minimum wait time between retries
--max-backoff         # Maximum wait time between retries
--max-doublings       # Times to double interval before constant increase
```

**Retry Behavior:**
- Cloud Tasks backs off on all errors
- Higher backoff for 429 (Too Many Requests) and 503 (Service Unavailable)
- Respects `Retry-After` HTTP response header
- Exponential backoff with configurable parameters

#### 4. Execution Guarantees

- **At least once delivery**: Tasks are guaranteed to execute at least once
- **Aims for exactly once**: >99.999% of tasks execute only once in production
- **Idempotency required**: Your code must handle potential duplicate executions
- Tasks can be retained for up to 31 days

#### 5. Integration with Cloud Run

**How it Works:**
1. Create a Cloud Task with target URL pointing to Cloud Run service
2. Cloud Tasks sends HTTP request to your Cloud Run endpoint
3. Cloud Run processes the task and returns HTTP 200 on success
4. If non-200 response, Cloud Tasks retries based on retry policy

**Requirements:**
- Cloud Run service must return HTTP 200-299 to confirm success
- Response must occur within configured timeout (default 10 min, max 30 min)
- For longer workloads, consider Cloud Run Jobs
- Use same GCP region for Cloud Tasks queue and Cloud Run service

**Authentication:**
- Cloud Tasks automatically adds OIDC token in Authorization header
- Service account allows Cloud Tasks to authenticate with Cloud Run

#### 6. BufferTask API (New Feature)

A simplified API that wraps HTTP requests into tasks without configuration:

- Caller sends regular HTTP request to Buffer API
- Buffer API wraps request using queue-level routing defaults
- No need to specify URL, headers, or authorization in task creation
- Easier integration with existing services (no code changes needed)

### Common Use Cases

1. **Preserving requests** through unexpected production incidents
2. **Smoothing traffic spikes** by delaying non-user-facing work
3. **Speeding user response** by delegating slow operations to background
4. **Rate limiting** calls to databases and third-party APIs
5. **Database updates** that don't need to happen synchronously
6. **Batch processing** of large datasets
7. **Email/notification sending** with retry logic

### Limitations

#### Task Ordering
- **No ordering guarantees** except for tasks scheduled in the future
- No guarantees that old tasks execute before new ones
- Queue must be completely emptied to guarantee old tasks execute

#### Timing Guarantees
- Guarantees delivery, not timing
- Not suitable for interactive applications where user waits for result
- Occasional delays may occur due to system restarts

#### Execution Order
- Tasks are platform-independent about execution order
- Cannot rely on FIFO or priority-based execution
- Use Cloud Run Jobs if you need specific ordering

---

## Google Cloud Scheduler

### What is Cloud Scheduler?

Cloud Scheduler is a fully managed enterprise-grade cron job scheduler that allows you to schedule virtually any job, including batch jobs, big data operations, and cloud infrastructure tasks.

### Key Features

#### 1. Cron Job Scheduling
- **Unix cron format** or App Engine syntax supported
- Define schedules: hourly, daily, weekly, monthly, or custom intervals
- Example formats:
  - `*/5 * * * *` - Every 5 minutes
  - `0 9 * * 1` - Every Monday at 9 AM
  - `0 0 1 * *` - First day of every month at midnight

#### 2. Target Types

Cloud Scheduler can trigger three types of targets:

1. **HTTP/HTTPS endpoints** (Cloud Run, external APIs, webhooks)
2. **Pub/Sub topics** (event-driven architectures)
3. **App Engine HTTP endpoints**

#### 3. Pub/Sub Integration

**Event-Driven Architecture:**
- Publish messages to Pub/Sub topics on schedule
- Multiple subscribers can consume same event
- Decouples scheduling from execution
- Facilitates asynchronous communication

**Setup Process:**
1. Create Pub/Sub topic in your project
2. Create Cloud Scheduler job with Pub/Sub target
3. Cloud Scheduler publishes messages as Google API service account
4. Subscribers receive and process messages

#### 4. Retry Policy
- Jobs not completing successfully are retried automatically
- Exponential backoff according to configured retry policy
- Configurable retry settings per job
- No acknowledgment from handler triggers retry

#### 5. Execution Guarantees
- **At least once delivery**: Job will run at least once per scheduled execution
- May execute more than once (design for idempotency)
- Retries on failure with exponential backoff

### Pricing

- **Free tier**: Up to 100 jobs per project
- **Paid tier**: $0.10 per job per 31 days ($0.003 per day per job)
- Not billed per execution, only per job created
- Very cost-effective for most use cases

---

## Comparison: Cloud Tasks vs Cloud Scheduler

| Feature | Cloud Tasks | Cloud Scheduler |
|---------|-------------|-----------------|
| **Purpose** | Asynchronous task queue | Scheduled cron jobs |
| **Trigger** | Event-driven (manual/programmatic) | Time-based (scheduled) |
| **Scheduling** | One-time or delayed execution | Recurring on cron schedule |
| **Use Case** | Process task now or later | Run job every day/hour/etc |
| **Rate Control** | Yes (queue-level) | No |
| **Retry Logic** | Configurable per queue | Configurable per job |
| **Targets** | HTTP endpoints | HTTP, Pub/Sub, App Engine |
| **Queue Management** | Multiple queues with different configs | One job per schedule |
| **Best For** | User-triggered actions, batch processing | Maintenance tasks, reports, recurring notifications |

### Common Pattern: Using Both Together

```
Cloud Scheduler → Triggers → Cloud Tasks Queue → Processes → Cloud Run Workers
```

Example: Daily appointment reminder system
1. Cloud Scheduler runs at 9 AM daily
2. Triggers Cloud Function to query appointments for tomorrow
3. Creates Cloud Task for each appointment reminder
4. Cloud Tasks rate-limits and sends to Cloud Run service
5. Cloud Run service sends SMS/email

---

## Use Cases for Medical Spa Platform

### 1. Appointment Reminders (Cloud Tasks + Cloud Scheduler)

**Architecture:**
```
Cloud Scheduler (Daily 9 AM)
  ↓
Cloud Function (Query tomorrow's appointments)
  ↓
Create Cloud Task per appointment
  ↓
Cloud Tasks Queue (Rate-limited to 10/sec)
  ↓
Cloud Run Service (Send SMS via Twilio)
```

**Benefits:**
- Schedule daily check for upcoming appointments
- Rate-limit SMS sending to avoid carrier throttling
- Retry failed sends automatically
- Track delivery status per appointment

### 2. Delayed Appointment Confirmations (Cloud Tasks)

**Flow:**
1. Patient books appointment online
2. Create Cloud Task scheduled for 1 hour later
3. Task checks if appointment still exists and not confirmed
4. Send confirmation reminder SMS
5. Retry if SMS fails

**Implementation:**
```typescript
// When appointment is created
await cloudTasksClient.createTask({
  parent: queuePath,
  task: {
    httpRequest: {
      url: 'https://your-service.run.app/send-confirmation',
      method: 'POST',
      body: Buffer.from(JSON.stringify({ appointmentId })),
      headers: { 'Content-Type': 'application/json' }
    },
    scheduleTime: {
      seconds: Date.now() / 1000 + 3600 // 1 hour delay
    }
  }
});
```

### 3. Pre-Visit Preparation Reminders (Cloud Scheduler + Cloud Tasks)

**Daily Schedule:**
- Cloud Scheduler runs at 8 AM
- Queries appointments 48 hours out requiring prep (e.g., Botox, fillers)
- Creates Cloud Task per patient with prep instructions
- Tasks execute with 5-minute delays to spread load

### 4. Batch Processing: Daily Reports (Cloud Scheduler)

**Use Cases:**
- Daily sales reports at 11 PM
- Weekly inventory audit every Sunday
- Monthly financial reconciliation
- Appointment analytics dashboard refresh

**Configuration:**
```bash
# Daily sales report
gcloud scheduler jobs create http daily-sales-report \
  --schedule="0 23 * * *" \
  --uri="https://your-service.run.app/reports/daily-sales" \
  --http-method=POST \
  --time-zone="America/Los_Angeles"
```

### 5. Waitlist Auto-Fill Notifications (Cloud Tasks)

**Scenario:**
1. Appointment cancellation occurs
2. Immediately create Cloud Task to check waitlist
3. Task queries eligible waitlist entries
4. Creates sub-tasks to notify each waitlist patient
5. Rate-limited to avoid spam (1 per 10 seconds)
6. First to respond gets the slot

### 6. Group Booking Reminders (Cloud Tasks)

**Complex Scheduling:**
- Group event in 3 days
- Send reminder to group organizer 72 hours before
- Send individual reminders 24 hours before
- Send "starting soon" notification 2 hours before

**Implementation:**
```typescript
// Create multiple delayed tasks
const delays = [
  { hours: 72, type: 'organizer-reminder' },
  { hours: 24, type: 'participant-reminder' },
  { hours: 2, type: 'starting-soon' }
];

for (const { hours, type } of delays) {
  await createDelayedTask({
    appointmentId,
    type,
    delaySeconds: hours * 3600
  });
}
```

### 7. Abandoned Cart Recovery (Cloud Tasks)

**E-commerce Flow:**
1. Patient adds products to cart but doesn't checkout
2. Create Cloud Task scheduled for 1 hour
3. If cart still abandoned, send reminder email
4. Create another task for 24 hours later
5. Send final reminder with discount code

### 8. Post-Treatment Follow-ups (Cloud Scheduler + Cloud Tasks)

**Schedule:**
- Cloud Scheduler runs daily at 10 AM
- Queries treatments completed 7 days ago
- Creates Cloud Task per patient
- Tasks send personalized follow-up survey
- Collects feedback for quality improvement

### 9. Inventory Reorder Alerts (Cloud Scheduler)

**Daily Check:**
- Run inventory check every morning at 8 AM
- Identify products below reorder threshold
- Send alert to inventory manager
- Create purchase order draft

### 10. SMS Campaign Delivery (Cloud Tasks)

**Bulk Messaging:**
- Marketing campaign to 1,000 patients
- Create 1,000 Cloud Tasks (one per recipient)
- Rate-limited to 10 SMS per second (carrier limit)
- Automatic retry on failures
- Track delivery status for each message

---

## Implementation Architecture

### Recommended Architecture for Medical Spa Platform

```
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Admin App                        │
│                  (Appointment Management)                    │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│                   Cloud Run API Service                      │
│            (NestJS/Express Backend on Cloud Run)            │
└────┬──────────────┬─────────────────┬───────────────────────┘
     │              │                 │
     │              ▼                 ▼
     │    ┌──────────────┐   ┌──────────────┐
     │    │ Cloud Tasks  │   │   Cloud      │
     │    │   Queue      │   │  Scheduler   │
     │    └──────┬───────┘   └──────┬───────┘
     │           │                  │
     │           ▼                  ▼
     │    ┌──────────────────────────────┐
     │    │   Task Handler Service       │
     │    │    (Cloud Run Service)       │
     │    └──────┬───────────────────────┘
     │           │
     ▼           ▼
┌──────────────────────────────────────────┐
│         External Services                │
│  • Twilio SMS                            │
│  • SendGrid Email                        │
│  • Stripe Payments                       │
│  • Cloud Storage                         │
└──────────────────────────────────────────┘
```

### Multi-Region Setup (for High Availability)

```
Region: us-central1 (Primary)
├── Cloud Tasks Queue: appointment-reminders
├── Cloud Scheduler: daily-reports
└── Cloud Run Service: task-handlers

Region: us-east1 (Backup)
├── Cloud Tasks Queue: appointment-reminders-backup
└── Cloud Run Service: task-handlers-backup
```

---

## Cloud Tasks vs BullMQ

### Comparison Matrix

| Feature | Google Cloud Tasks | BullMQ |
|---------|-------------------|---------|
| **Type** | Fully managed cloud service | Self-hosted library (Node.js) |
| **Infrastructure** | No infrastructure to manage | Requires Redis instance |
| **Execution Target** | HTTP endpoints only | Worker processes in Node.js |
| **Task Ordering** | No ordering guarantees | Supports FIFO, LIFO, priorities |
| **Delivery Guarantee** | At least once | At least once with Redis persistence |
| **Ecosystem** | GCP-native, polyglot | Node.js ecosystem only |
| **Cost Model** | Pay per task (small fee) | Redis hosting costs + free library |
| **Job Dependencies** | Not supported | Parent-child dependencies supported |
| **Scheduling** | Delayed tasks (future time) | Full cron-style scheduling built-in |
| **Monitoring** | GCP Console + Cloud Monitoring | BullMQ Dashboard (separate) |
| **Scalability** | Automatically scales | Horizontal scaling (add workers) |
| **Setup Complexity** | Minimal (API calls only) | Moderate (Redis + worker setup) |
| **Memory Usage** | None (fully managed) | Redis can consume significant memory |

### When to Choose Cloud Tasks

**Best for:**
- Multi-language environments (not just Node.js)
- Serverless architectures (Cloud Run, Cloud Functions)
- No infrastructure management desired
- HTTP-based task execution
- Google Cloud ecosystem integration
- Simple delayed execution needs

**Advantages:**
- Zero infrastructure maintenance
- No Redis dependency
- Automatic scaling
- Built-in monitoring and logging
- IAM-based security
- Multi-region support out of the box

### When to Choose BullMQ

**Best for:**
- Node.js-only environments
- Need for job priorities and ordering (FIFO/LIFO)
- Parent-child job dependencies
- Already using Redis for other purposes
- Complex job workflows
- Lower per-task costs at very high volume

**Advantages:**
- Rich feature set for job management
- Active community and ecosystem
- Job priorities and ordering
- Parent-child dependencies
- In-memory persistence (fast)
- No external service fees (just Redis hosting)

**Disadvantages:**
- Redis dependency and memory consumption
- Infrastructure to manage (Redis cluster)
- Node.js only
- Requires worker processes to stay running
- More complex monitoring setup

### Cost Comparison Example

**Scenario**: 1 million tasks per month

**Cloud Tasks:**
- Pricing varies by region and usage
- Very small per-task fee
- No infrastructure costs
- **Estimated**: ~$40-80/month

**BullMQ:**
- Redis hosting (managed): ~$15-100/month (depends on instance size)
- Compute for workers: ~$20-50/month
- Library: Free
- **Estimated**: ~$35-150/month

**Note**: Cloud Tasks is often more cost-effective when factoring in developer time saved on infrastructure management.

---

## Cloud Scheduler vs Vercel Cron

### Comparison Matrix

| Feature | Google Cloud Scheduler | Vercel Cron |
|---------|----------------------|-------------|
| **Type** | Fully managed GCP service | Vercel platform feature |
| **Execution Limit** | No time limit (use Cloud Run Jobs for long tasks) | 15 minutes max (hard limit) |
| **Jobs Per Project** | No hard limit | 20 cron jobs max per project |
| **Scheduling Accuracy** | Precise to the minute | Hobby: hourly accuracy; Pro: minute accuracy |
| **Retry Policy** | Configurable retries with exponential backoff | No automatic retries |
| **Targets** | HTTP, Pub/Sub, App Engine | Vercel Functions only |
| **Pricing** | $0.10/job/31 days (after free 100 jobs) | Based on function execution time |
| **Platform Lock-in** | GCP | Vercel |
| **Background Processes** | Yes (persistent processes via Cloud Run) | No (isolated serverless functions only) |
| **State Management** | Yes (external storage) | No direct state management |
| **Duplication** | Rare | May deliver same event multiple times |
| **Setup Complexity** | Moderate (GCP console or CLI) | Simple (Vercel config file) |

### When to Choose Cloud Scheduler

**Best for:**
- Long-running jobs (>15 minutes)
- Need for retry logic and error handling
- Persistent processes or state management
- Multi-cloud or non-Vercel deployment
- Enterprise-grade reliability requirements
- Complex job orchestration

**Advantages:**
- No execution time limits (with Cloud Run Jobs)
- Configurable retry policies
- Multiple target types (HTTP, Pub/Sub, App Engine)
- Can trigger complex workflows
- Better monitoring and alerting
- More granular scheduling control

### When to Choose Vercel Cron

**Best for:**
- Already deploying on Vercel
- Simple, short-running tasks (<15 minutes)
- Serverless-first architecture
- Quick setup with minimal configuration
- Tightly integrated with Vercel Functions

**Advantages:**
- Simple configuration (vercel.json)
- Integrated with Vercel deployment
- Easy to set up and manage
- Good for simple scheduled tasks
- No separate service to manage

**Disadvantages:**
- Hard 15-minute execution limit
- Only 20 cron jobs per project
- No automatic retries
- Hobby tier: only hourly accuracy
- Possible duplicate executions
- No persistent processes
- Vercel platform lock-in

### Architecture Notes

**Vercel's Backend:**
Vercel implemented their Cron Jobs feature using Amazon EventBridge Scheduler, which allows them to create, manage, and run scheduled tasks at scale. Within a few months of release, they reached over 7 million weekly cron invocations.

**Cloud Scheduler's Flexibility:**
Cloud Scheduler can trigger any HTTP endpoint, not just functions on a specific platform. This makes it suitable for hybrid and multi-cloud architectures.

---

## Pricing and Quotas

### Cloud Tasks Pricing

Google Cloud uses pay-as-you-go pricing. You only pay for the services you use.

**Key Points:**
- Pricing varies by region
- Small per-task operation fee
- No infrastructure costs
- No minimum fee

For detailed pricing, visit: [Cloud Tasks Pricing](https://cloud.google.com/tasks/pricing)

### Cloud Scheduler Pricing

**Pricing Tiers:**
- **Free tier**: Up to 100 jobs per project
- **Paid tier**: $0.10 per job per 31 days
  - Daily cost: $0.003 per job
  - Billed by job created, not by executions

**Example Costs:**
- 10 jobs: Free
- 150 jobs: $5/month (50 paid jobs × $0.10)
- 500 jobs: $40/month (400 paid jobs × $0.10)

### Cloud Tasks Quotas and Limits

Google Cloud uses quotas to ensure fairness and reduce spikes in resource usage.

**Quota Types:**
1. **Adjustable quotas**: Have default values but can be increased on request
2. **System limits**: Fixed values that cannot be changed

**Key Concepts:**
- Quotas are per Google Cloud project
- Quotas are shared across all applications and IP addresses in a project
- When quota is exceeded, system blocks access and task fails
- You don't need paid support to request quota adjustments

**Common Quotas** (check official docs for current values):
- Maximum queue dispatches per second
- Maximum task size
- Maximum queue count
- Maximum tasks per queue
- Task retention period: Up to 31 days

**Requesting Quota Increases:**
1. Visit Quotas page in Google Cloud Console
2. Find the quota you want to increase
3. Request adjustment with justification
4. Google reviews and approves/denies
5. Use quota adjuster for automatic adjustments based on usage patterns

**Quota Management Best Practices:**
- Monitor quota usage regularly
- Request increases proactively before hitting limits
- Use multiple queues to distribute load
- Consider using quota adjuster for predictable growth

For complete quota details: [Cloud Tasks Quotas](https://cloud.google.com/tasks/docs/quotas)

### Cloud Scheduler Quotas

For complete quota details: [Cloud Scheduler Quotas](https://cloud.google.com/scheduler/quotas)

---

## Implementation Guide

### Prerequisites

1. **Google Cloud Project**
   - Create a GCP project
   - Enable billing
   - Enable Cloud Tasks API
   - Enable Cloud Scheduler API
   - Enable Cloud Run API (if using Cloud Run)

2. **Service Account**
   - Create service account for Cloud Tasks
   - Grant necessary IAM roles:
     - `roles/cloudtasks.admin`
     - `roles/cloudscheduler.admin`
     - `roles/run.invoker` (for Cloud Run)

3. **Development Environment**
   - Install gcloud CLI
   - Authenticate: `gcloud auth login`
   - Set project: `gcloud config set project PROJECT_ID`

### Step 1: Set Up Cloud Tasks Queue

#### Using gcloud CLI

```bash
# Create a queue
gcloud tasks queues create appointment-reminders \
  --location=us-central1 \
  --max-dispatches-per-second=10 \
  --max-concurrent-dispatches=100 \
  --max-attempts=5 \
  --min-backoff=60s \
  --max-backoff=3600s \
  --max-doublings=16

# List queues
gcloud tasks queues list --location=us-central1

# Update queue configuration
gcloud tasks queues update appointment-reminders \
  --location=us-central1 \
  --max-dispatches-per-second=20

# Pause queue (stop processing)
gcloud tasks queues pause appointment-reminders \
  --location=us-central1

# Resume queue
gcloud tasks queues resume appointment-reminders \
  --location=us-central1

# Delete queue
gcloud tasks queues delete appointment-reminders \
  --location=us-central1
```

#### Using Node.js SDK

```typescript
import { CloudTasksClient } from '@google-cloud/tasks';

const client = new CloudTasksClient();
const project = 'your-project-id';
const location = 'us-central1';
const queue = 'appointment-reminders';

// Create queue
const parent = client.locationPath(project, location);
const [response] = await client.createQueue({
  parent,
  queue: {
    name: client.queuePath(project, location, queue),
    rateLimits: {
      maxDispatchesPerSecond: 10,
      maxConcurrentDispatches: 100,
    },
    retryConfig: {
      maxAttempts: 5,
      minBackoff: { seconds: 60 },
      maxBackoff: { seconds: 3600 },
      maxDoublings: 16,
    },
  },
});

console.log(`Created queue: ${response.name}`);
```

### Step 2: Create Cloud Run Service (Task Handler)

#### Dockerfile

```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8080

CMD ["node", "server.js"]
```

#### server.js (Express Example)

```javascript
const express = require('express');
const app = express();

app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Task handler endpoint
app.post('/tasks/send-reminder', async (req, res) => {
  try {
    const { appointmentId, patientPhone, message } = req.body;

    console.log(`Processing reminder for appointment: ${appointmentId}`);

    // Your business logic here
    // e.g., send SMS via Twilio
    await sendSMS(patientPhone, message);

    // Return 200 to acknowledge success
    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Task processing failed:', error);

    // Return 500 to trigger retry
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Task handler listening on port ${PORT}`);
});
```

#### Deploy to Cloud Run

```bash
# Build and deploy
gcloud run deploy task-handlers \
  --source . \
  --region us-central1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --timeout 300s \
  --min-instances 0 \
  --max-instances 10

# Get service URL
gcloud run services describe task-handlers \
  --region us-central1 \
  --format 'value(status.url)'
```

### Step 3: Create Tasks Programmatically

#### Node.js Example

```typescript
import { CloudTasksClient } from '@google-cloud/tasks';

interface ReminderTask {
  appointmentId: string;
  patientPhone: string;
  message: string;
  delaySeconds?: number;
}

async function createReminderTask(data: ReminderTask) {
  const client = new CloudTasksClient();

  const project = 'your-project-id';
  const location = 'us-central1';
  const queue = 'appointment-reminders';

  const parent = client.queuePath(project, location, queue);
  const serviceUrl = 'https://task-handlers-xxxxx.run.app';
  const url = `${serviceUrl}/tasks/send-reminder`;

  const task = {
    httpRequest: {
      httpMethod: 'POST',
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      body: Buffer.from(JSON.stringify(data)).toString('base64'),
      oidcToken: {
        serviceAccountEmail: 'task-service@your-project.iam.gserviceaccount.com',
      },
    },
  };

  // Add delay if specified
  if (data.delaySeconds) {
    const scheduleTime = Date.now() / 1000 + data.delaySeconds;
    task.scheduleTime = {
      seconds: scheduleTime,
    };
  }

  const [response] = await client.createTask({ parent, task });

  console.log(`Created task: ${response.name}`);
  return response;
}

// Usage example
async function sendAppointmentReminder() {
  await createReminderTask({
    appointmentId: 'apt_12345',
    patientPhone: '+15555551234',
    message: 'Reminder: You have an appointment tomorrow at 2 PM.',
    delaySeconds: 3600, // Send in 1 hour
  });
}
```

#### Python Example

```python
from google.cloud import tasks_v2
from google.protobuf import timestamp_pb2
import json
import datetime

def create_reminder_task(appointment_id, patient_phone, message, delay_seconds=0):
    client = tasks_v2.CloudTasksClient()

    project = 'your-project-id'
    location = 'us-central1'
    queue = 'appointment-reminders'

    parent = client.queue_path(project, location, queue)
    service_url = 'https://task-handlers-xxxxx.run.app'
    url = f'{service_url}/tasks/send-reminder'

    payload = {
        'appointmentId': appointment_id,
        'patientPhone': patient_phone,
        'message': message
    }

    task = {
        'http_request': {
            'http_method': tasks_v2.HttpMethod.POST,
            'url': url,
            'headers': {
                'Content-Type': 'application/json'
            },
            'body': json.dumps(payload).encode(),
            'oidc_token': {
                'service_account_email': 'task-service@your-project.iam.gserviceaccount.com'
            }
        }
    }

    if delay_seconds > 0:
        schedule_time = timestamp_pb2.Timestamp()
        schedule_time.FromDatetime(
            datetime.datetime.utcnow() + datetime.timedelta(seconds=delay_seconds)
        )
        task['schedule_time'] = schedule_time

    response = client.create_task(request={'parent': parent, 'task': task})

    print(f'Created task: {response.name}')
    return response

# Usage
create_reminder_task(
    appointment_id='apt_12345',
    patient_phone='+15555551234',
    message='Reminder: You have an appointment tomorrow at 2 PM.',
    delay_seconds=3600  # 1 hour delay
)
```

### Step 4: Set Up Cloud Scheduler Jobs

#### Using gcloud CLI

```bash
# Create HTTP target job
gcloud scheduler jobs create http daily-report \
  --location=us-central1 \
  --schedule="0 23 * * *" \
  --uri="https://your-service.run.app/reports/daily" \
  --http-method=POST \
  --time-zone="America/Los_Angeles" \
  --oidc-service-account-email="scheduler@your-project.iam.gserviceaccount.com" \
  --oidc-token-audience="https://your-service.run.app"

# Create Pub/Sub target job
gcloud scheduler jobs create pubsub process-appointments \
  --location=us-central1 \
  --schedule="0 9 * * *" \
  --topic=appointment-processing \
  --message-body='{"action":"process_reminders"}' \
  --time-zone="America/Los_Angeles"

# List jobs
gcloud scheduler jobs list --location=us-central1

# Run job immediately (for testing)
gcloud scheduler jobs run daily-report --location=us-central1

# Update job
gcloud scheduler jobs update http daily-report \
  --location=us-central1 \
  --schedule="0 22 * * *"

# Delete job
gcloud scheduler jobs delete daily-report --location=us-central1
```

#### Using Node.js SDK

```typescript
import { CloudSchedulerClient } from '@google-cloud/scheduler';

async function createScheduledJob() {
  const client = new CloudSchedulerClient();

  const project = 'your-project-id';
  const location = 'us-central1';

  const parent = client.locationPath(project, location);

  const job = {
    name: client.jobPath(project, location, 'daily-report'),
    description: 'Generate daily sales report',
    schedule: '0 23 * * *', // 11 PM daily
    timeZone: 'America/Los_Angeles',
    httpTarget: {
      uri: 'https://your-service.run.app/reports/daily',
      httpMethod: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Buffer.from(JSON.stringify({ reportType: 'daily-sales' })).toString('base64'),
      oidcToken: {
        serviceAccountEmail: 'scheduler@your-project.iam.gserviceaccount.com',
        audience: 'https://your-service.run.app',
      },
    },
    retryConfig: {
      retryCount: 3,
      maxRetryDuration: { seconds: 3600 },
      minBackoffDuration: { seconds: 60 },
      maxBackoffDuration: { seconds: 600 },
    },
  };

  const [response] = await client.createJob({ parent, job });

  console.log(`Created job: ${response.name}`);
  return response;
}
```

### Step 5: Set Up Pub/Sub Integration (Optional)

```bash
# Create Pub/Sub topic
gcloud pubsub topics create appointment-events

# Create subscription
gcloud pubsub subscriptions create appointment-processor \
  --topic=appointment-events \
  --push-endpoint=https://your-service.run.app/pubsub/appointments

# Create Cloud Function to consume messages
gcloud functions deploy appointment-processor \
  --runtime nodejs20 \
  --trigger-topic appointment-events \
  --entry-point processAppointment \
  --region us-central1
```

---

## Best Practices

### 1. Design for Idempotency

Tasks may execute more than once. Ensure your handlers are idempotent.

```typescript
// Bad: Not idempotent
app.post('/tasks/send-reminder', async (req, res) => {
  await sendSMS(phone, message);
  res.status(200).send('OK');
});

// Good: Idempotent with deduplication
app.post('/tasks/send-reminder', async (req, res) => {
  const { taskId, phone, message } = req.body;

  // Check if already processed
  const exists = await db.checkTaskProcessed(taskId);
  if (exists) {
    console.log(`Task ${taskId} already processed`);
    return res.status(200).send('OK');
  }

  // Process task
  await sendSMS(phone, message);

  // Mark as processed
  await db.markTaskProcessed(taskId);

  res.status(200).send('OK');
});
```

### 2. Return Correct HTTP Status Codes

- **200-299**: Success (task won't retry)
- **500-599**: Error (task will retry)
- **429**: Too Many Requests (Cloud Tasks will back off more aggressively)

```typescript
app.post('/tasks/process', async (req, res) => {
  try {
    await processTask(req.body);
    res.status(200).send('OK'); // Success

  } catch (error) {
    if (error.code === 'RATE_LIMIT') {
      res.status(429).send('Rate limited'); // Back off more
    } else if (error.code === 'INVALID_DATA') {
      res.status(400).send('Bad request'); // Don't retry
    } else {
      res.status(500).send('Error'); // Retry
    }
  }
});
```

### 3. Use Task Names for Deduplication

```typescript
async function createTask(appointmentId: string) {
  const taskName = client.taskPath(
    project,
    location,
    queue,
    `reminder-${appointmentId}-${Date.now()}`
  );

  await client.createTask({
    parent,
    task: {
      name: taskName, // Named tasks are deduplicated
      httpRequest: { /* ... */ }
    }
  });
}
```

### 4. Configure Appropriate Timeouts

```typescript
// Cloud Run service timeout
gcloud run services update task-handlers \
  --timeout 300s # 5 minutes

// Cloud Tasks timeout (in task creation)
const task = {
  httpRequest: {
    url,
    // Cloud Tasks default timeout is 10 minutes
    // Max is 30 minutes
  },
  dispatchDeadline: { seconds: 600 } // 10 minutes
};
```

### 5. Monitor and Alert

```typescript
// Log all task executions
app.post('/tasks/*', (req, res, next) => {
  const startTime = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - startTime;
    console.log(JSON.stringify({
      taskPath: req.path,
      statusCode: res.statusCode,
      duration,
      taskHeaders: req.headers,
    }));
  });

  next();
});

// Set up Cloud Monitoring alerts
// - Task queue depth exceeds threshold
// - Task failure rate above 5%
// - Task latency p95 above 30 seconds
```

### 6. Use Separate Queues for Different Priorities

```bash
# High priority queue (appointment reminders)
gcloud tasks queues create high-priority \
  --max-dispatches-per-second=50

# Low priority queue (analytics, reports)
gcloud tasks queues create low-priority \
  --max-dispatches-per-second=5
```

### 7. Implement Circuit Breakers

```typescript
class CircuitBreaker {
  private failures = 0;
  private lastFailure = 0;
  private readonly threshold = 5;
  private readonly timeout = 60000; // 1 minute

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    if (this.isOpen()) {
      throw new Error('Circuit breaker is open');
    }

    try {
      const result = await fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private isOpen(): boolean {
    return this.failures >= this.threshold &&
           Date.now() - this.lastFailure < this.timeout;
  }

  private onSuccess() {
    this.failures = 0;
  }

  private onFailure() {
    this.failures++;
    this.lastFailure = Date.now();
  }
}

// Usage
const twilioCircuitBreaker = new CircuitBreaker();

app.post('/tasks/send-sms', async (req, res) => {
  try {
    await twilioCircuitBreaker.execute(() => sendSMS(phone, message));
    res.status(200).send('OK');
  } catch (error) {
    res.status(500).send('Service unavailable');
  }
});
```

### 8. Use Task Metadata for Debugging

```typescript
async function createTask(data: any) {
  const task = {
    httpRequest: {
      url,
      body: Buffer.from(JSON.stringify(data)).toString('base64'),
      headers: {
        'Content-Type': 'application/json',
        'X-Task-Created': new Date().toISOString(),
        'X-Task-Source': 'appointment-service',
        'X-Task-Version': 'v1.0',
      },
    },
  };

  await client.createTask({ parent, task });
}
```

### 9. Implement Graceful Degradation

```typescript
app.post('/tasks/send-reminder', async (req, res) => {
  try {
    // Primary: SMS
    await sendSMS(phone, message);
  } catch (smsError) {
    console.error('SMS failed, falling back to email', smsError);

    try {
      // Fallback: Email
      await sendEmail(email, message);
    } catch (emailError) {
      console.error('Email also failed', emailError);

      // Last resort: Save to database for manual processing
      await db.saveFailedNotification({
        phone,
        email,
        message,
        attempts: [smsError.message, emailError.message],
      });
    }
  }

  // Always return 200 to prevent infinite retries
  res.status(200).send('OK');
});
```

### 10. Use Environment-Specific Queues

```typescript
const environment = process.env.NODE_ENV || 'development';
const queueName = `appointment-reminders-${environment}`;

// Development: appointment-reminders-development
// Staging: appointment-reminders-staging
// Production: appointment-reminders-production
```

---

## Code Examples

### Complete Appointment Reminder System

#### 1. Task Queue Service (tasks.service.ts)

```typescript
import { CloudTasksClient } from '@google-cloud/tasks';
import { config } from './config';

export interface AppointmentReminderTask {
  appointmentId: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  patientEmail: string;
  appointmentTime: string;
  serviceType: string;
  providerName: string;
}

export class TaskQueueService {
  private client: CloudTasksClient;
  private queuePath: string;

  constructor() {
    this.client = new CloudTasksClient();
    this.queuePath = this.client.queuePath(
      config.gcp.projectId,
      config.gcp.location,
      config.gcp.queueName
    );
  }

  async createReminderTask(
    data: AppointmentReminderTask,
    delaySeconds: number = 0
  ): Promise<void> {
    const taskId = `reminder-${data.appointmentId}-${Date.now()}`;
    const taskName = this.client.taskPath(
      config.gcp.projectId,
      config.gcp.location,
      config.gcp.queueName,
      taskId
    );

    const url = `${config.cloudRun.serviceUrl}/tasks/send-appointment-reminder`;

    const task: any = {
      name: taskName,
      httpRequest: {
        httpMethod: 'POST',
        url,
        headers: {
          'Content-Type': 'application/json',
          'X-Task-ID': taskId,
        },
        body: Buffer.from(JSON.stringify(data)).toString('base64'),
        oidcToken: {
          serviceAccountEmail: config.gcp.serviceAccountEmail,
        },
      },
    };

    if (delaySeconds > 0) {
      const scheduleTime = Date.now() / 1000 + delaySeconds;
      task.scheduleTime = { seconds: scheduleTime };
    }

    try {
      const [response] = await this.client.createTask({
        parent: this.queuePath,
        task,
      });

      console.log(`Created task: ${response.name}`);
    } catch (error) {
      console.error('Failed to create task:', error);
      throw error;
    }
  }

  async createMultipleReminders(
    appointmentId: string,
    data: AppointmentReminderTask
  ): Promise<void> {
    // 24 hours before
    await this.createReminderTask(
      { ...data, type: '24-hour' },
      86400 // 24 hours in seconds
    );

    // 2 hours before
    await this.createReminderTask(
      { ...data, type: '2-hour' },
      7200 // 2 hours in seconds
    );

    console.log(`Created multiple reminders for appointment: ${appointmentId}`);
  }
}
```

#### 2. Task Handler (task-handler.controller.ts)

```typescript
import { Request, Response } from 'express';
import { TwilioService } from './twilio.service';
import { DatabaseService } from './database.service';

export class TaskHandlerController {
  constructor(
    private twilioService: TwilioService,
    private databaseService: DatabaseService
  ) {}

  async sendAppointmentReminder(req: Request, res: Response): Promise<void> {
    const taskId = req.headers['x-task-id'] as string;

    try {
      // Check if already processed (idempotency)
      const processed = await this.databaseService.isTaskProcessed(taskId);
      if (processed) {
        console.log(`Task ${taskId} already processed`);
        res.status(200).send('OK');
        return;
      }

      const {
        appointmentId,
        patientId,
        patientName,
        patientPhone,
        appointmentTime,
        serviceType,
        providerName,
      } = req.body;

      // Verify appointment still exists and is not cancelled
      const appointment = await this.databaseService.getAppointment(appointmentId);
      if (!appointment || appointment.status === 'cancelled') {
        console.log(`Appointment ${appointmentId} not found or cancelled`);
        res.status(200).send('OK');
        return;
      }

      // Format reminder message
      const message = `Hi ${patientName}, this is a reminder for your ${serviceType} appointment with ${providerName} on ${appointmentTime}. Reply CONFIRM or call us at (555) 123-4567.`;

      // Send SMS
      await this.twilioService.sendSMS(patientPhone, message);

      // Log notification
      await this.databaseService.logNotification({
        appointmentId,
        patientId,
        type: 'sms',
        channel: 'appointment-reminder',
        message,
        status: 'sent',
        sentAt: new Date(),
      });

      // Mark task as processed
      await this.databaseService.markTaskProcessed(taskId);

      res.status(200).json({ success: true });

    } catch (error) {
      console.error('Task processing failed:', error);

      // Log error
      await this.databaseService.logError({
        taskId,
        error: error.message,
        stack: error.stack,
        timestamp: new Date(),
      });

      // Return 500 to trigger retry
      res.status(500).json({ error: error.message });
    }
  }
}
```

#### 3. Scheduler Job Handler (scheduler-handler.controller.ts)

```typescript
import { Request, Response } from 'express';
import { DatabaseService } from './database.service';
import { TaskQueueService } from './tasks.service';

export class SchedulerHandlerController {
  constructor(
    private databaseService: DatabaseService,
    private taskQueueService: TaskQueueService
  ) {}

  async processDailyReminders(req: Request, res: Response): Promise<void> {
    try {
      console.log('Starting daily reminder processing...');

      // Get appointments for tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      tomorrow.setHours(0, 0, 0, 0);

      const appointments = await this.databaseService.getAppointmentsByDate(tomorrow);

      console.log(`Found ${appointments.length} appointments for tomorrow`);

      // Create reminder task for each appointment
      for (const appointment of appointments) {
        await this.taskQueueService.createReminderTask({
          appointmentId: appointment.id,
          patientId: appointment.patientId,
          patientName: appointment.patient.name,
          patientPhone: appointment.patient.phone,
          patientEmail: appointment.patient.email,
          appointmentTime: appointment.startTime,
          serviceType: appointment.service.name,
          providerName: appointment.provider.name,
        });
      }

      console.log(`Created ${appointments.length} reminder tasks`);

      res.status(200).json({
        success: true,
        appointmentsProcessed: appointments.length,
      });

    } catch (error) {
      console.error('Daily reminder processing failed:', error);
      res.status(500).json({ error: error.message });
    }
  }

  async generateDailyReport(req: Request, res: Response): Promise<void> {
    try {
      console.log('Generating daily sales report...');

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const report = await this.databaseService.getDailySalesReport(today);

      // Save report to storage
      await this.databaseService.saveReport({
        type: 'daily-sales',
        date: today,
        data: report,
      });

      // Send email to managers
      // await this.emailService.sendReport(report);

      console.log('Daily report generated successfully');

      res.status(200).json({ success: true });

    } catch (error) {
      console.error('Report generation failed:', error);
      res.status(500).json({ error: error.message });
    }
  }
}
```

#### 4. Appointment Service Integration (appointment.service.ts)

```typescript
import { TaskQueueService } from './tasks.service';

export class AppointmentService {
  constructor(
    private taskQueueService: TaskQueueService,
    private databaseService: DatabaseService
  ) {}

  async createAppointment(appointmentData: any): Promise<Appointment> {
    // Create appointment in database
    const appointment = await this.databaseService.createAppointment(appointmentData);

    // Calculate delay for 24-hour reminder
    const appointmentTime = new Date(appointment.startTime).getTime();
    const now = Date.now();
    const delay24h = Math.max(0, (appointmentTime - now - 86400000) / 1000);

    // Calculate delay for 2-hour reminder
    const delay2h = Math.max(0, (appointmentTime - now - 7200000) / 1000);

    // Schedule reminders
    if (delay24h > 0) {
      await this.taskQueueService.createReminderTask({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patient.name,
        patientPhone: appointment.patient.phone,
        patientEmail: appointment.patient.email,
        appointmentTime: appointment.startTime,
        serviceType: appointment.service.name,
        providerName: appointment.provider.name,
      }, delay24h);
    }

    if (delay2h > 0) {
      await this.taskQueueService.createReminderTask({
        appointmentId: appointment.id,
        patientId: appointment.patientId,
        patientName: appointment.patient.name,
        patientPhone: appointment.patient.phone,
        patientEmail: appointment.patient.email,
        appointmentTime: appointment.startTime,
        serviceType: appointment.service.name,
        providerName: appointment.provider.name,
      }, delay2h);
    }

    return appointment;
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    // Update appointment status
    await this.databaseService.updateAppointment(appointmentId, {
      status: 'cancelled',
      cancelledAt: new Date(),
    });

    // Note: Scheduled tasks will check appointment status before sending
    // No need to delete tasks from queue

    console.log(`Cancelled appointment: ${appointmentId}`);
  }
}
```

#### 5. Configuration (config.ts)

```typescript
export const config = {
  gcp: {
    projectId: process.env.GCP_PROJECT_ID || 'medical-spa-platform',
    location: process.env.GCP_LOCATION || 'us-central1',
    queueName: process.env.TASK_QUEUE_NAME || 'appointment-reminders',
    serviceAccountEmail: process.env.GCP_SERVICE_ACCOUNT || 'tasks@medical-spa.iam.gserviceaccount.com',
  },
  cloudRun: {
    serviceUrl: process.env.CLOUD_RUN_URL || 'https://task-handlers-xxxxx.run.app',
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
};
```

#### 6. Express Server (server.ts)

```typescript
import express from 'express';
import { TaskHandlerController } from './controllers/task-handler.controller';
import { SchedulerHandlerController } from './controllers/scheduler-handler.controller';
import { TwilioService } from './services/twilio.service';
import { DatabaseService } from './services/database.service';
import { TaskQueueService } from './services/tasks.service';

const app = express();
app.use(express.json());

// Initialize services
const twilioService = new TwilioService();
const databaseService = new DatabaseService();
const taskQueueService = new TaskQueueService();

// Initialize controllers
const taskHandler = new TaskHandlerController(twilioService, databaseService);
const schedulerHandler = new SchedulerHandlerController(databaseService, taskQueueService);

// Health check
app.get('/', (req, res) => {
  res.status(200).send('OK');
});

// Task endpoints
app.post('/tasks/send-appointment-reminder', (req, res) =>
  taskHandler.sendAppointmentReminder(req, res)
);

// Scheduler endpoints
app.post('/scheduler/daily-reminders', (req, res) =>
  schedulerHandler.processDailyReminders(req, res)
);

app.post('/scheduler/daily-report', (req, res) =>
  schedulerHandler.generateDailyReport(req, res)
);

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
```

---

## Conclusion

Google Cloud Tasks and Cloud Scheduler provide robust, scalable solutions for managing background jobs and scheduled tasks in cloud-native applications.

### Key Takeaways

1. **Cloud Tasks** is ideal for asynchronous, event-driven task processing with rate limiting and retry logic
2. **Cloud Scheduler** is perfect for recurring cron jobs and scheduled maintenance tasks
3. Both services integrate seamlessly with Cloud Run for serverless execution
4. Design handlers to be idempotent and return appropriate HTTP status codes
5. Use separate queues for different priorities and use cases
6. Monitor task execution and set up alerts for failures

### Recommended Architecture for Medical Spa Platform

```
User Action → Next.js App → Cloud Run API
                              ↓
                        Cloud Tasks Queue
                              ↓
                    Task Handler (Cloud Run)
                              ↓
                    External Services (Twilio, etc.)

Daily Schedule → Cloud Scheduler
                        ↓
                  Cloud Function
                        ↓
                  Create Cloud Tasks
                        ↓
                  Task Handler (Cloud Run)
```

### Next Steps

1. Set up GCP project and enable required APIs
2. Create service accounts with appropriate IAM roles
3. Deploy task handler Cloud Run service
4. Create Cloud Tasks queues
5. Set up Cloud Scheduler jobs
6. Implement monitoring and alerting
7. Test end-to-end flows in development
8. Deploy to production with gradual rollout

---

## Additional Resources

### Documentation
- [Cloud Tasks Documentation](https://cloud.google.com/tasks/docs)
- [Cloud Scheduler Documentation](https://cloud.google.com/scheduler/docs)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Pub/Sub Documentation](https://cloud.google.com/pubsub/docs)

### API References
- [Cloud Tasks API Reference](https://cloud.google.com/tasks/docs/reference/rest)
- [Cloud Scheduler API Reference](https://cloud.google.com/scheduler/docs/reference/rest)
- [Node.js Client Libraries](https://cloud.google.com/nodejs/docs/reference)

### Tutorials
- [Executing asynchronous tasks with Cloud Run](https://cloud.google.com/run/docs/triggering/using-tasks)
- [Trigger Cloud Run functions using Cloud Tasks](https://cloud.google.com/tasks/docs/tutorial-gcf)
- [Schedule Cloud Run functions with Cloud Scheduler](https://cloud.google.com/scheduler/docs/tut-gcf-pub-sub)
- [Buffer HTTP requests with Cloud Tasks](https://cloud.google.com/blog/products/serverless/buffer-http-requests-with-cloud-tasks)

### Monitoring & Operations
- [Cloud Monitoring](https://cloud.google.com/monitoring)
- [Cloud Logging](https://cloud.google.com/logging)
- [Error Reporting](https://cloud.google.com/error-reporting)

---

## Sources

This guide was compiled using the following sources:

**Cloud Tasks Documentation:**
- [Configure Cloud Tasks queues](https://cloud.google.com/tasks/docs/configuring-queues)
- [Issues and limitations](https://docs.cloud.google.com/tasks/docs/common-pitfalls)
- [Understand Cloud Tasks](https://cloud.google.com/tasks/docs/dual-overview)
- [REST Resource: tasks](https://docs.cloud.google.com/tasks/docs/reference/rest/v2/projects.locations.queues.tasks)
- [Executing asynchronous tasks with Cloud Run](https://cloud.google.com/run/docs/triggering/using-tasks)
- [Trigger Cloud Run functions using Cloud Tasks](https://docs.cloud.google.com/tasks/docs/tutorial-gcf)
- [Buffer HTTP requests with Cloud Tasks](https://cloud.google.com/blog/products/serverless/buffer-http-requests-with-cloud-tasks)
- [Enqueue functions with Cloud Tasks - Firebase](https://firebase.google.com/docs/functions/task-functions)

**Cloud Scheduler Documentation:**
- [Quickstart: Schedule and run a cron job](https://docs.cloud.google.com/scheduler/docs/schedule-run-cron-job)
- [Manage cron jobs](https://docs.cloud.google.com/scheduler/docs/creating)
- [Pricing](https://cloud.google.com/scheduler/pricing)
- [About Cloud Scheduler](https://docs.cloud.google.com/scheduler/docs/overview)
- [Schedule an event-driven Cloud Run function](https://cloud.google.com/scheduler/docs/tut-gcf-pub-sub)
- [Schedule functions - Firebase](https://firebase.google.com/docs/functions/schedule-functions)

**Comparisons & Alternatives:**
- [Best BullMQ Alternatives in 2025](https://stackshare.io/bullmq/alternatives)
- [Schedulers in Node: A Comparison](https://betterstack.com/community/guides/scaling-nodejs/best-nodejs-schedulers/)
- [How To Handle Asynchronous Tasks with BullMQ](https://www.digitalocean.com/community/tutorials/how-to-handle-asynchronous-tasks-with-node-js-and-bullmq)
- [Vercel Cron Jobs Documentation](https://vercel.com/docs/cron-jobs)
- [Usage & Pricing for Cron Jobs](https://vercel.com/docs/cron-jobs/usage-and-pricing)
- [How Vercel Shipped Cron Jobs Using Amazon EventBridge](https://aws.amazon.com/blogs/aws/how-vercel-shipped-cron-jobs-in-2-months-using-amazon-eventbridge-scheduler/)
- [Best Vercel Alternatives](https://northflank.com/blog/best-vercel-alternatives-for-scalable-deployments)

**Pricing & Quotas:**
- [Cloud Tasks Quotas and limits](https://cloud.google.com/tasks/docs/quotas)
- [Cloud Tasks Pricing](https://cloud.google.com/tasks/pricing)
- [Cloud Scheduler Quotas and limits](https://cloud.google.com/scheduler/quotas)
- [Cloud Quotas overview](https://docs.cloud.google.com/docs/quotas/overview)

**Additional Resources:**
- [Compare Cloud Tasks to Cloud Scheduler](https://cloud.google.com/tasks/docs/comp-tasks-sched)
- [Cloud Run Jobs: A Beginner's Guide](https://geshan.com.np/blog/2025/04/cloud-run-jobs/)
- [Scheduling tasks on GCP](https://medium.com/@keseruk/scheduling-tasks-on-the-google-cloud-platform-gcp-8a4e3daf0f9a)

---

**Document Version**: 1.0
**Last Updated**: December 23, 2025
**Author**: Medical Spa Platform Development Team
