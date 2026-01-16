# Auto-Close Conversations Service

Automatically closes inactive conversations based on configurable time thresholds to keep the inbox organized and improve patient engagement.

## Overview

The Auto-Close Conversations Service monitors all open conversations and automatically closes those that haven't had activity for a specified period. This helps:

- Keep inbox focused on active patient communication
- Archive stale conversations
- Improve conversation statistics and metrics
- Reduce staff cognitive load

## Files

- **Service**: `/src/services/conversations/auto-close.ts`
- **Cron Endpoint**: `/src/app/api/cron/auto-close-conversations/route.ts`
- **Tests**: `/src/__tests__/conversations/auto-close.test.ts`
- **Index**: `/src/services/conversations/index.ts`

## Configuration

### Default Configuration

```typescript
{
  enabled: true,                    // Enable/disable the service
  closureOptions: {
    oneDay: false,                  // Close after 1 day of inactivity
    threeDays: true,                // Close after 3 days of inactivity
    sevenDays: true,                // Close after 7 days of inactivity
    fourteenDays: true              // Close after 14 days of inactivity
  },
  skipIfPendingConfirmation: true,  // Don't close conversations awaiting confirmation
  sendNotificationBeforeClose: true, // Notify before auto-closing
  notificationHoursBefore: 24,      // Hours before closure to notify
  logClosure: true                  // Log all closure events
}
```

### Updating Configuration

```typescript
import { autoCloseConversationsService } from '@/services/conversations';

// Update entire config
autoCloseConversationsService.updateConfig({
  enabled: true,
  closureOptions: {
    oneDay: false,
    threeDays: true,
    sevenDays: true,
    fourteenDays: false
  }
});

// Or update specific fields
autoCloseConversationsService.updateConfig({
  notificationHoursBefore: 48
});
```

## API Endpoints

### GET - Run Auto-Close Process

**Cron endpoint** - Run the auto-close process:

```bash
curl -H "Authorization: Bearer YOUR_CRON_SECRET" \
  "https://yourapp.com/api/cron/auto-close-conversations"
```

**Response:**
```json
{
  "success": true,
  "timestamp": "2024-01-09T15:30:00Z",
  "results": {
    "closures": 15,
    "notifications": 8,
    "conversationsChecked": 156,
    "skipped": 25,
    "pendingConfirmationSkipped": 5
  },
  "statistics": {
    "totalClosed": 156,
    "closuresByReason": {
      "Automatic closure: No activity for 3 days": 10,
      "Automatic closure: No activity for 7 days": 5
    }
  }
}
```

**Query Parameters:**
- `dryRun=true` - Preview changes without executing
- `config={"enabled":false}` - Override configuration (JSON string)

### POST - Manual Triggers

#### Process Auto-Closures

```bash
curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"process"}' \
  "https://yourapp.com/api/cron/auto-close-conversations"
```

#### Reopen a Conversation

```bash
curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"reopen","conversationId":"conv-123"}' \
  "https://yourapp.com/api/cron/auto-close-conversations"
```

#### Get Closure History

```bash
curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"getHistory","limit":100}' \
  "https://yourapp.com/api/cron/auto-close-conversations"
```

#### Get Statistics

```bash
curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"action":"getStatistics"}' \
  "https://yourapp.com/api/cron/auto-close-conversations"
```

#### Update Configuration

```bash
curl -X POST -H "Authorization: Bearer YOUR_CRON_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "action":"updateConfig",
    "config":{"enabled":false,"notificationHoursBefore":48}
  }' \
  "https://yourapp.com/api/cron/auto-close-conversations"
```

## Service Usage

### Getting Statistics

```typescript
import { autoCloseConversationsService } from '@/services/conversations';

const stats = autoCloseConversationsService.getStatistics();
console.log(`Total conversations closed: ${stats.totalClosed}`);
console.log('Closures by reason:', stats.closuresByReason);
console.log('Last closure:', stats.lastClosure);
```

### Getting History

```typescript
const history = autoCloseConversationsService.getClosureHistory(50);
history.forEach(closure => {
  console.log(`${closure.patientName}: ${closure.reason}`);
});
```

### Reopening a Conversation

```typescript
try {
  await autoCloseConversationsService.reopenConversation('conv-123');
  console.log('Conversation reopened');
} catch (error) {
  console.error('Failed to reopen:', error);
}
```

### Running Auto-Close Process

```typescript
const result = await autoCloseConversationsService.processAutoClosures();
console.log(`Closed ${result.closuresCount} conversations`);
console.log(`Sent ${result.notificationsCount} notifications`);
```

## Scheduling with Cron

### Vercel Cron

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

### EasyCron

Create a scheduled task with URL:
```
https://yourapp.com/api/cron/auto-close-conversations
Authorization Header: Bearer YOUR_CRON_SECRET
Frequency: Daily at 2 AM
```

### GitHub Actions

Create `.github/workflows/auto-close.yml`:

```yaml
name: Auto-Close Conversations

on:
  schedule:
    - cron: '0 2 * * *'

jobs:
  auto-close:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Trigger auto-close
        run: |
          curl -H "Authorization: Bearer ${{ secrets.CRON_SECRET }}" \
            "${{ secrets.APP_URL }}/api/cron/auto-close-conversations"
```

## Features

### 1. Configurable Closure Periods

Choose which inactivity periods trigger auto-closure:
- After 1 day of inactivity
- After 3 days of inactivity
- After 7 days of inactivity
- After 14 days of inactivity

### 2. Pending Confirmation Handling

Conversations awaiting patient confirmation can be protected from auto-closure:

```typescript
autoCloseConversationsService.updateConfig({
  skipIfPendingConfirmation: true // Default: true
});
```

### 3. Pre-Closure Notifications

Notify staff before conversations auto-close:

```typescript
autoCloseConversationsService.updateConfig({
  sendNotificationBeforeClose: true,
  notificationHoursBefore: 24 // Notify 24 hours before
});
```

### 4. Comprehensive Logging

All closure events are logged with:
- Conversation ID and patient info
- Days since last activity
- Closure reason
- Related metadata (assigned staff, tags, channel)

### 5. Statistics and Reporting

Track auto-closure metrics:

```typescript
const stats = autoCloseConversationsService.getStatistics();
// Returns: totalClosed, lastClosure, closuresByReason
```

## How It Works

### Activity Tracking

The service checks `lastActivityAt` timestamp for each conversation:

```typescript
interface ConversationForAutoClose {
  id: string;
  patientId: string;
  lastActivityAt: Date;    // When last message was sent/received
  status: 'open' | 'snoozed' | 'closed';
  pendingConfirmation?: boolean;
  // ... other fields
}
```

### Closure Decision Logic

1. **Skip closed conversations** - Already closed conversations are ignored
2. **Check pending confirmation** - If enabled and conversation has pending confirmation, skip
3. **Calculate days inactive** - Time elapsed since `lastActivityAt`
4. **Match against config** - Compare to enabled closure periods
5. **Send pre-notification** - If configured, notify hours before threshold
6. **Close conversation** - Set status to 'closed' and log event

### Logging

All closures are logged with:

```typescript
interface ConversureClosure {
  conversationId: string;
  patientId: string;
  closedAt: Date;
  reason: string;
  daysSinceLastActivity: number;
  hadPendingConfirmation: boolean;
  notificationSentBefore?: boolean;
  metadata: Record<string, any>;
}
```

## Configuration Presets

### Aggressive Closure (1-3 days)

```typescript
autoCloseConversationsService.updateConfig({
  closureOptions: {
    oneDay: true,
    threeDays: true,
    sevenDays: false,
    fourteenDays: false
  }
});
```

### Conservative Closure (7-14 days)

```typescript
autoCloseConversationsService.updateConfig({
  closureOptions: {
    oneDay: false,
    threeDays: false,
    sevenDays: true,
    fourteenDays: true
  }
});
```

### Balanced Closure (3-7 days)

```typescript
autoCloseConversationsService.updateConfig({
  closureOptions: {
    oneDay: false,
    threeDays: true,
    sevenDays: true,
    fourteenDays: false
  }
});
```

### Disabled

```typescript
autoCloseConversationsService.updateConfig({
  enabled: false
});
```

## Error Handling

The service handles errors gracefully:

```typescript
try {
  const result = await autoCloseConversationsService.processAutoClosures();

  if (!result.success) {
    console.error('Auto-close failed:', result.errors);
  }
} catch (error) {
  console.error('Fatal error:', error);
}
```

### Common Errors

- **Unauthorized** (401) - Invalid or missing CRON_SECRET
- **Invalid config override** (400) - Malformed JSON in config parameter
- **Invalid action** (400) - Unknown POST action

## Testing

Run the test suite:

```bash
npm run test -- auto-close.test.ts
```

### Test Coverage

- Configuration management
- Closure logic for all periods (1/3/7/14 days)
- Pending confirmation handling
- Statistics and history tracking
- Edge cases (closed/snoozed conversations)
- Configuration presets

## Best Practices

1. **Test before scheduling** - Use dry run to preview changes:
   ```
   /api/cron/auto-close-conversations?dryRun=true
   ```

2. **Start conservative** - Use 7-14 day closures initially, then adjust

3. **Monitor statistics** - Regularly check closure patterns and adjust thresholds

4. **Respect pending confirmation** - Keep `skipIfPendingConfirmation: true` enabled

5. **Set appropriate notifications** - Give staff warning before auto-closure (24 hours recommended)

6. **Manual override** - Allow staff to reopen conversations immediately after closing

7. **Audit logging** - Enable `logClosure: true` for compliance and debugging

## Environment Variables

```env
CRON_SECRET=your_secret_key_here
```

## Database Integration (Production)

The service currently uses mock implementations for:

- `getConversationsForClosureCheck()` - Returns empty array
- `updateConversationStatus()` - Logs to console

For production, implement these to query/update your database:

```typescript
private async getConversationsForClosureCheck(): Promise<ConversationForAutoClose[]> {
  // Query database for open/snoozed conversations
  const conversations = await db.conversation.findMany({
    where: {
      status: { in: ['open', 'snoozed'] }
    },
    include: { patient: true }
  });

  return conversations.map(conv => ({
    id: conv.id,
    patientId: conv.patientId,
    // ... map other fields
  }));
}

private async updateConversationStatus(
  conversationId: string,
  status: 'open' | 'closed'
): Promise<void> {
  await db.conversation.update({
    where: { id: conversationId },
    data: { status }
  });
}
```

## Troubleshooting

### Conversations not closing

1. Check if service is enabled: `service.getConfig().enabled`
2. Verify closure options are set: `service.getConfig().closureOptions`
3. Check if conversations have pending confirmation
4. Verify database query is returning conversations (mock currently returns empty)

### Notifications not sending

1. Check notification settings: `service.getConfig().sendNotificationBeforeClose`
2. Verify notification timing: `service.getConfig().notificationHoursBefore`
3. Check notification service is initialized

### Wrong activity timestamp

1. Ensure `lastActivityAt` is updated when messages are sent/received
2. Check timezone if using scheduled cron

## Future Enhancements

- Dashboard widget showing auto-closure statistics
- Configurable notifications with custom messages
- Whitelist/blacklist patterns (e.g., VIP patients never auto-close)
- Bulk reopen with filters
- Archive closed conversations instead of just closing
- Analytics on closure rates and reasons
