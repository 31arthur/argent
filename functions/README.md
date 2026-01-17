# Firebase Cloud Functions for Argent AI Agent

This directory contains Firebase Cloud Functions that expose the AI agent to the frontend.

## Architecture

**Thin Transport Layer**: These functions are a minimal security and transport layer that delegates to existing domain services.

**NO Business Logic**: All business logic resides in the domain layer (`src/domain`).

## Functions

### 1. agentMessage

**Purpose**: Handle user chat messages sent to the AI agent.

**Input**:
```typescript
{
    conversationId?: string;  // Optional - created if not provided
    message: string;          // Required - user message
}
```

**Output**:
```typescript
{
    conversationId: string;
    agentState: AgentState;
    message: string;
    confirmationPayload?: ConfirmationPayload;
    selectableOptions?: SelectableOption[];
    updatedDraft?: Partial<TransactionDraft>;
    requiresUserInput: boolean;
}
```

**Usage** (from client):
```typescript
const result = await httpsCallable(functions, 'agentMessage')({
    message: 'Spent 500 on groceries'
});
```

---

### 2. agentConfirmDraft

**Purpose**: Finalize a CONFIRMED TransactionDraft (create real transaction).

**Input**:
```typescript
{
    draftId: string;  // Required - draft to finalize
}
```

**Output**:
```typescript
{
    status: 'SUCCESS' | 'ALREADY_FINALIZED' | 'ERROR';
    transactionId?: string;
    errorCode?: string;
    errorMessage?: string;
}
```

**Usage** (from client):
```typescript
const result = await httpsCallable(functions, 'agentConfirmDraft')({
    draftId: 'draft-123'
});
```

---

### 3. agentCancelConversation

**Purpose**: Explicitly cancel an active agent conversation.

**Input**:
```typescript
{
    conversationId: string;  // Required - conversation to cancel
}
```

**Output**:
```typescript
{
    success: boolean;
    conversationId: string;
}
```

**Usage** (from client):
```typescript
const result = await httpsCallable(functions, 'agentCancelConversation')({
    conversationId: 'conv-123'
});
```

---

## Security

All functions:
- ✅ Require Firebase Authentication
- ✅ Verify resource ownership
- ✅ Validate all inputs
- ✅ Log errors server-side
- ✅ Return user-safe error messages

---

## Development

### Install Dependencies

```bash
cd functions
npm install
```

### Build

```bash
npm run build
```

### Run Locally (Emulator)

```bash
npm run serve
```

### Deploy

```bash
npm run deploy
```

---

## Environment Variables

Set in Firebase Functions config:

```bash
firebase functions:config:set gemini.api_key="your_api_key_here"
firebase functions:config:set gemini.model="gemini-pro"
firebase functions:config:set gemini.timeout_ms="10000"
```

Or use `.env` file for local development.

---

## Logging

All functions use structured logging:

```typescript
logger.info('Message processed', {
    function: 'agentMessage',
    userId: 'user-123',
    conversationId: 'conv-456',
    agentState: 'WAITING_CONFIRMATION',
});
```

**Privacy Rules**:
- ✅ Log IDs (userId, conversationId, draftId)
- ✅ Log state transitions
- ✅ Log error codes
- ❌ Never log raw user messages
- ❌ Never log extracted amounts/descriptions

---

## Error Handling

Errors are mapped to Firebase HttpsError codes:

- `unauthenticated` - User not authenticated
- `permission-denied` - User doesn't own resource
- `invalid-argument` - Invalid input
- `not-found` - Resource not found
- `failed-precondition` - Draft not confirmed
- `internal` - Internal error

---

## Testing

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration
```

---

## File Structure

```
functions/
├── src/
│   ├── http/
│   │   ├── agentMessage.ts
│   │   ├── agentConfirmDraft.ts
│   │   └── agentCancelConversation.ts
│   ├── bootstrap/
│   │   ├── firestore.ts
│   │   └── container.ts
│   ├── middleware/
│   │   ├── auth.ts
│   │   └── validation.ts
│   ├── utils/
│   │   ├── logger.ts
│   │   └── errors.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

---

## License

MIT
