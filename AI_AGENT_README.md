# AI Agent for Transaction Extraction

A production-ready AI Agent system that extracts transaction data from natural language, allows field-level edits, and requires explicit user confirmation before creating transactions.

## Features

✅ **Gemini API Integration** - Natural language processing with timeout handling  
✅ **Confirmation Loop** - Explicit user confirmation required (no auto-save)  
✅ **Field-Level Edits** - Edit any field while preserving unchanged data  
✅ **Cancel Anytime** - Draft preserved for audit trail  
✅ **Firestore Persistence** - Full CRUD operations for drafts and conversations  
✅ **i18n Support** - Internationalization-ready with calm, neutral tone  
✅ **Comprehensive Testing** - Unit, integration, and repository tests  

---

## Architecture

```
User Input
    ↓
AgentOrchestrator
    ├── GeminiExtractionService (Gemini API)
    ├── HintResolutionService (Entity matching)
    ├── EditIntentDetector (Field detection)
    ├── TargetedFieldExtractor (Targeted extraction)
    ├── ClarificationStrategy (Missing fields)
    └── DraftMutationService (Field updates)
    ↓
Repositories
    ├── TransactionDraftRepository
    ├── AgentConversationRepository
    └── ChatMessageRepository
    ↓
Firestore
```

---

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create or update `.env`:

```
GEMINI_API_KEY=your_actual_api_key_here
GEMINI_MODEL=gemini-pro
GEMINI_TIMEOUT_MS=10000
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage
```

### 4. Start Development Server

```bash
npm run dev
```

---

## Usage Example

```typescript
import { AgentOrchestrator } from '@/domain/services/AgentOrchestrator';

// Initialize orchestrator with repositories
const orchestrator = new AgentOrchestrator(
    conversationRepository,
    draftRepository,
    poolRepository,
    categoryRepository
);

// Handle user message
const response = await orchestrator.handleAgentMessage(
    userId,
    conversationId,
    "Spent 500 on groceries"
);

// Response structure
if (response.confirmationPayload) {
    // Show confirmation card
    console.log(response.confirmationPayload.summary);
} else if (response.selectableOptions) {
    // Show option buttons
    console.log(response.selectableOptions);
} else {
    // Show text message
    console.log(response.message);
}
```

---

## Conversation Flow

### 1. Initial Extraction

```
User: "Spent 500 on groceries"
Agent: "Which account or wallet?" (ASKING_CLARIFICATION)
```

### 2. Clarification

```
User: "Main Wallet"
Agent: Shows confirmation summary (WAITING_CONFIRMATION)
```

### 3. Edit Loop

```
User: "change amount to 150"
Agent: Shows updated confirmation (WAITING_CONFIRMATION)
```

### 4. Confirmation

```
User: "confirm"
Agent: "Transaction draft confirmed." (COMPLETED)
```

---

## Testing

### Run Tests

```bash
# All tests
npm test

# Watch mode
npm test -- --watch

# Coverage
npm run test:coverage
```

### Test Structure

```
src/
├── domain/services/__tests__/
│   ├── EditIntentDetector.test.ts
│   └── AgentOrchestrator.integration.test.ts
└── data/repositories/__tests__/
    └── TransactionDraftRepository.test.ts
```

See [TESTING.md](./TESTING.md) for detailed testing guide.

---

## Firestore Collections

### `transactionDrafts`

**Required Indexes**:
- `userId + createdAt (descending)`
- `conversationId + status`

### `agentConversations`

**Required Indexes**:
- `userId + lastActivityAt (descending)`
- `userId + agentState`

### `chatMessages`

**Required Indexes**:
- `conversationId + timestamp (ascending)`

---

## i18n Keys

All agent messages use i18n keys for internationalization. See `src/presentation/i18n/locales/en/agent.json` for all translations.

---

## Next Steps

### UI Integration

1. Create chat interface components
2. Create confirmation card component
3. Create selectable options component
4. Integrate with HandleAgentMessage use case

### Production Deployment

1. Set actual GEMINI_API_KEY
2. Configure Firestore indexes
3. Add error monitoring
4. Implement rate limiting

---

## License

MIT
