# Auto-Close Conversations - Implementation Guide

## Quick Start (5 minutes)

### 1. Set Environment Variable

```bash
# Add to .env.local
CRON_SECRET=your-secure-random-secret-here
```

### 2. Test the Endpoint

```bash
# Manual test
curl -H "Authorization: Bearer your-secure-random-secret-here" \
  "http://localhost:3000/api/cron/auto-close-conversations?dryRun=true"
```

Expected response:
```json
{
  "success": true,
  "timestamp": "2024-01-09T15:30:00Z",
  "dryRun": true,
  "results": {
    "closures": 0,
    "notifications": 0,
    "conversationsChecked": 0
  }
}
```

### 3. Schedule with Vercel Cron (if using Vercel)

Add to `vercel.json`:
```json
{
  "crons": [
    {
      "path": "/api/cron/auto-close-conversations",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### 4. Use in Your Code

```typescript
import { autoCloseConversationsService } from '@/services/conversations';

// Get statistics
const stats = autoCloseConversationsService.getStatistics();
console.log(`Total conversations closed: ${stats.totalClosed}`);

// Reopen if needed
await autoCloseConversationsService.reopenConversation('conv-123');
```

---

## Step-by-Step Integration

### Phase 1: Database Integration (Required for Production)

The service currently returns empty data because database queries are mocked. You need to implement:

#### 1.1 Update `getConversationsForClosureCheck()`

File: `/src/services/conversations/auto-close.ts`

Replace this:
```typescript
private async getConversationsForClosureCheck(): Promise<ConversationForAutoClose[]> {
  console.log('[AUTO_CLOSE_FETCH] Fetching conversations from database');
  return [];
}
```

With your database query (Prisma example):
```typescript
private async getConversationsForClosureCheck(): Promise<ConversationForAutoClose[]> {
  const conversations = await db.conversation.findMany({
    where: {
      status: { in: ['open', 'snoozed'] }
    },
    include: {
      patient: true
    }
  });

  return conversations.map(conv => ({
    id: conv.id,
    patientId: conv.patientId,
    patientName: conv.patient.name,
    patientPhone: conv.patient.phone,
    patientEmail: conv.patient.email,
    lastActivityAt: conv.lastActivityAt,
    lastMessageAt: conv.lastMessageAt,
    status: conv.status as 'open' | 'snoozed' | 'closed',
    channel: conv.channel as 'sms' | 'email' | 'web_chat' | 'phone',
    pendingConfirmation: conv.pendingConfirmation,
    assignedTo: conv.assignedTo,
    tags: conv.tags,
    unreadCount: conv.unreadCount
  }));
}
```

#### 1.2 Update `updateConversationStatus()`

Replace this:
```typescript
private async updateConversationStatus(conversationId: string, status: 'open' | 'closed'): Promise<void> {
  console.log(`[AUTO_CLOSE_DB] Updated conversation ${conversationId} status to ${status}`);
}
```

With:
```typescript
private async updateConversationStatus(conversationId: string, status: 'open' | 'closed'): Promise<void> {
  await db.conversation.update({
    where: { id: conversationId },
    data: { status }
  });
}
```

### Phase 2: Notification Integration (Recommended)

The service already integrates with the notification service. To customize notifications:

Update the `sendPreClosureNotification()` method:

```typescript
private async sendPreClosureNotification(conversation: ConversationForAutoClose): Promise<void> {
  try {
    // Send SMS notification to patient if opted in
    if (conversation.channel === 'sms') {
      await messagingService.sendSMS({
        to: conversation.patientPhone,
        body: `Hi ${conversation.patientName.split(' ')[0]}, just checking in! Please reply if you need anything. This conversation will close in ${this.config.notificationHoursBefore} hours if we don't hear from you.`,
        patientId: conversation.patientId,
        metadata: {
          type: 'pre_closure_notification',
          conversationId: conversation.id
        }
      });
    }

    // Notify staff
    notificationService.notify({
      type: 'info',
      title: 'Conversation Auto-Close Warning',
      message: `Conversation with ${conversation.patientName} will close in ${this.config.notificationHoursBefore} hours`,
      persistent: false
    });
  } catch (error) {
    console.error('Failed to send pre-closure notification:', error);
  }
}
```

### Phase 3: Logging Integration (Optional)

Update `logClosure()` to write to your audit log:

```typescript
private async logClosure(closure: ConversureClosure): Promise<void> {
  await db.auditLog.create({
    data: {
      action: 'CONVERSATION_AUTO_CLOSED',
      conversationId: closure.conversationId,
      patientId: closure.patientId,
      reason: closure.reason,
      metadata: {
        daysSinceLastActivity: closure.daysSinceLastActivity,
        hadPendingConfirmation: closure.hadPendingConfirmation,
        ...closure.metadata
      }
    }
  });
}
```

---

## Configuration Scenarios

### Scenario 1: Aggressive Cleanup

For busy med spas that need a clean inbox:

```typescript
// Set via API
curl -X POST -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "updateConfig",
    "config": {
      "closureOptions": {
        "oneDay": true,
        "threeDays": true,
        "sevenDays": false,
        "fourteenDays": false
      },
      "skipIfPendingConfirmation": true,
      "notificationHoursBefore": 12
    }
  }' \
  "https://yourapp.com/api/cron/auto-close-conversations"
```

### Scenario 2: Conservative Approach

For spas prioritizing never missing a patient:

```typescript
{
  "closureOptions": {
    "oneDay": false,
    "threeDays": false,
    "sevenDays": true,
    "fourteenDays": true
  },
  "skipIfPendingConfirmation": true,
  "sendNotificationBeforeClose": true,
  "notificationHoursBefore": 48
}
```

### Scenario 3: Disabled (Until Ready)

If integrating gradually:

```typescript
{
  "enabled": false
}
```

---

## Monitoring & Maintenance

### Check Service Health

```bash
# Get statistics
curl -X POST -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"getStatistics"}' \
  "https://yourapp.com/api/cron/auto-close-conversations"
```

### View Recent Closures

```bash
curl -X POST -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"getHistory","limit":20}' \
  "https://yourapp.com/api/cron/auto-close-conversations"
```

### Manual Override

```bash
# Reopen a conversation
curl -X POST -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"reopen","conversationId":"conv-123"}' \
  "https://yourapp.com/api/cron/auto-close-conversations"
```

---

## Testing Before Production

### 1. Test with Dry Run

```bash
curl -H "Authorization: Bearer YOUR_SECRET" \
  "https://yourapp.com/api/cron/auto-close-conversations?dryRun=true"
```

### 2. Create Test Conversations

```typescript
// Create conversations with old activity timestamps for testing
const testConv = {
  id: 'test-conv-123',
  patientId: 'p-test',
  patientName: 'Test Patient',
  patientPhone: '+15551234567',
  lastActivityAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000), // 8 days ago
  status: 'open',
  channel: 'sms',
  tags: ['test'],
  unreadCount: 0
};
```

### 3. Monitor First Run

```bash
# Check statistics after first run
curl -X POST -H "Authorization: Bearer YOUR_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"getStatistics"}' \
  "https://yourapp.com/api/cron/auto-close-conversations"
```

---

## API Testing Examples

### cURL Examples

```bash
# Run auto-close with dry run
curl -H "Authorization: Bearer my-secret" \
  "http://localhost:3000/api/cron/auto-close-conversations?dryRun=true"

# Update configuration
curl -X POST \
  -H "Authorization: Bearer my-secret" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "updateConfig",
    "config": {
      "closureOptions": {
        "oneDay": false,
        "threeDays": true,
        "sevenDays": true,
        "fourteenDays": false
      }
    }
  }' \
  "http://localhost:3000/api/cron/auto-close-conversations"

# Get statistics
curl -X POST \
  -H "Authorization: Bearer my-secret" \
  -H "Content-Type: application/json" \
  -d '{"action": "getStatistics"}' \
  "http://localhost:3000/api/cron/auto-close-conversations"
```

### TypeScript Examples

```typescript
// In a React component or API route
const runAutoClose = async (dryRun = true) => {
  const response = await fetch('/api/cron/auto-close-conversations?dryRun=' + dryRun, {
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}` // Or from env
    }
  });

  const data = await response.json();
  console.log('Closed:', data.results.closures);
};

// Get statistics
const getStats = async () => {
  const response = await fetch('/api/cron/auto-close-conversations', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CRON_SECRET}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ action: 'getStatistics' })
  });

  return response.json();
};
```

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `Unauthorized` (401) error | Check CRON_SECRET is correct and set in environment |
| No conversations being closed | Verify database query returns conversations (currently mocked) |
| Notifications not sent | Verify notificationService is initialized |
| Wrong closure times | Check `lastActivityAt` timestamps are correct and timezone |
| Can't reopen conversation | Verify conversation exists and is in database |

---

## Next Steps

1. ✅ Deploy service files
2. ✅ Set CRON_SECRET environment variable
3. ⚠️ Implement database queries (Phase 1)
4. ⚠️ Test with dry run
5. ⚠️ Schedule cron job
6. ⚠️ Monitor and adjust configuration
7. ⚠️ Add UI components for manual management (optional)

---

## Support & Questions

- Service logs appear in: `console.log` and `console.error` with `[AUTO_CLOSE_*]` prefix
- Test file: `/src/__tests__/conversations/auto-close.test.ts`
- Documentation: `/docs/AUTO_CLOSE_CONVERSATIONS.md`
