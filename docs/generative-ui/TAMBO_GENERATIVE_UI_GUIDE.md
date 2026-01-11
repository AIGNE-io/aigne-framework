# Tambo Generative UI: The Magic Explained

**A practical guide for engineers**

***

## TL;DR - The Core Magic

Tambo treats React components as functions that AI can call. Here's the entire flow:

```
1. You register a component with a Zod schema
2. Backend converts it to an LLM tool
3. User asks for something
4. LLM "calls" the component like a function
5. Props stream in real-time
6. React renders the component progressively
```

**That's it.** Everything else is just plumbing to make this work reliably.

***

## The Big Idea

### Traditional Chatbot

```
User: "I need a contact form"
AI:   "Here's how to build a contact form: [wall of text]"
User: *starts coding*
```

### Tambo

```
User: "I need a contact form"
AI:   *instantly renders interactive form*
User: *uses it immediately*
```

**The AI doesn't describe the UI - it builds it.**

***

## How It Actually Works

### Step 1: Component Registration

You register a React component with a schema:

```typescript
// Your normal React component
const ContactForm = ({ fields, onSubmit }) => {
  const [data, setData] = useTamboComponentState("formData", {});

  return (
    <form onSubmit={() => onSubmit(data)}>
      {fields.map(field => (
        <input
          key={field.id}
          type={field.type}
          placeholder={field.label}
          onChange={e => setData({ ...data, [field.id]: e.target.value })}
        />
      ))}
      <button type="submit">Submit</button>
    </form>
  );
};

// Register with Tambo
<TamboProvider
  components={[
    {
      name: "ContactForm",
      description: "A form for collecting user contact information",
      component: ContactForm,
      propsSchema: z.object({
        fields: z.array(z.object({
          id: z.string(),
          type: z.enum(["text", "email", "phone"]),
          label: z.string()
        })),
        onSubmit: z.function()
      })
    }
  ]}
>
  <YourApp />
</TamboProvider>
```

### Step 2: What Happens in the Backend

The backend does this transformation:

```typescript
// Your component registration
{
  name: "ContactForm",
  propsSchema: z.object({ fields: z.array(...) })
}

// ↓ Converts to ↓

// LLM tool definition
{
  type: "function",
  function: {
    name: "ui_ContactForm",  // Note the "ui_" prefix!
    description: "A form for collecting user contact information",
    parameters: {
      "type": "object",
      "properties": {
        "fields": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": { "type": "string" },
              "type": { "type": "string", "enum": ["text", "email", "phone"] },
              "label": { "type": "string" }
            }
          }
        }
      }
    }
  }
}
```

**Key insight:** The LLM sees your component as a callable function with typed parameters.

### Step 3: User Interaction

```
User: "Create a contact form with name, email, and phone"
```

### Step 4: LLM Decision

The LLM sees available tools including `ui_ContactForm` and decides:

```json
{
  "tool_calls": [{
    "type": "function",
    "function": {
      "name": "ui_ContactForm",
      "arguments": {
        "fields": [
          { "id": "name", "type": "text", "label": "Name" },
          { "id": "email", "type": "email", "label": "Email" },
          { "id": "phone", "type": "phone", "label": "Phone" }
        ]
      }
    }
  }]
}
```

### Step 5: Streaming Magic

Here's where it gets interesting. The LLM streams the response character by character:

```javascript
// Chunk 1
'{"tool_calls":[{"function":{"name":"ui_ContactForm","arguments":"{"'

// Chunk 2
'{"tool_calls":[{"function":{"name":"ui_ContactForm","arguments":"{"fields":[{'

// Chunk 3
'{"tool_calls":[{"function":{"name":"ui_ContactForm","arguments":"{"fields":[{"id":"name"'

// ... and so on
```

**The backend uses `partial-json` to parse incomplete JSON:**

```typescript
import { parse } from "partial-json";

// Even with incomplete JSON, we get usable data
parse('{"fields":[{"id":"name","type":"t');
// Returns: { fields: [{ id: "name", type: "t" }] }

// More complete
parse('{"fields":[{"id":"name","type":"text","label":"Name"},{"id":"em');
// Returns: { fields: [{ id: "name", type: "text", label: "Name" }, { id: "em" }] }
```

### Step 6: Progressive Rendering

Each chunk updates the React component:

```typescript
// Chunk arrives from backend via SSE
for await (const chunk of streamFromBackend) {
  // 1. Parse (possibly incomplete) props
  const props = parse(chunk.component.props);

  // 2. Validate against schema
  const validated = schema.parse(props);

  // 3. Create React element
  const element = React.createElement(ContactForm, validated);

  // 4. Trigger re-render
  setRenderedComponent(element);
}
```

**Your component re-renders as each field arrives!**

```
Render 1: <form>{/* name field only */}</form>
Render 2: <form>{/* name + email fields */}</form>
Render 3: <form>{/* name + email + phone fields */}</form>
```

***

## The Three Key Components

### 1. Frontend: React SDK

**What it does:**

* Manages component registry
* Receives SSE stream from backend
* Parses partial JSON
* Validates props
* Renders components

**Key hook:**

```typescript
const { sendThreadMessage, thread } = useTamboThread();

// Send message
await sendThreadMessage("Create a contact form");

// Get messages (including rendered components)
thread.messages.map(msg => (
  <div>
    {msg.renderedComponent || msg.content}
  </div>
))
```

### 2. Backend: NestJS API

**What it does:**

* Converts components to LLM tools
* Calls LLM with tools
* Streams responses via SSE
* Persists messages to database

**Main endpoint:**

```
POST /threads/:id/advancestream
Content-Type: text/event-stream

Response (SSE):
data: {"responseMessageDto":{"component":{"componentName":"ContactForm","props":{...}}}}\n\n
```

### 3. LLM Integration: Decision Loop

**What it does:**

* Separates UI tools (prefix: `ui_`) from action tools
* Calls LLM with all tools
* Parses streaming tool calls
* Yields component decisions

**Location:** `packages/backend/src/services/decision-loop/decision-loop-service.ts`

***

## Real Example: Form Generation

### Input

```
User: "I need a registration form"
```

### Behind the Scenes

**1. Backend builds prompt:**

```
System: You have access to these tools:
- ui_ContactForm: A form for collecting user contact information
- ui_NoteComponent: Display a note
- search_database: Search the database

User: I need a registration form

Choose a tool to use.
```

**2. LLM response (streaming):**

```json
{
  "tool_calls": [{
    "function": {
      "name": "ui_ContactForm",
      "arguments": "{\"fields\":[{\"id\":\"username\",\"type\":\"text\",\"label\":\"Username\"},{\"id\":\"email\",\"type\":\"email\",\"label\":\"Email\"},{\"id\":\"password\",\"type\":\"password\",\"label\":\"Password\"}]}"
    }
  }]
}
```

**3. Backend streams to frontend:**

```javascript
// SSE event 1
data: {"component":{"componentName":"ContactForm","props":{}}}\n\n

// SSE event 2
data: {"component":{"componentName":"ContactForm","props":{"fields":[{"id":"username"}]}}}\n\n

// SSE event 3
data: {"component":{"componentName":"ContactForm","props":{"fields":[{"id":"username","type":"text"},{"id":"email"}]}}}\n\n

// ... continues until complete
```

**4. React renders progressively:**

```tsx
// Initial render (empty)
<ContactForm fields={[]} />

// After chunk 2
<ContactForm fields={[{ id: "username" }]} />

// After chunk 3
<ContactForm fields={[
  { id: "username", type: "text" },
  { id: "email" }
]} />

// Final render
<ContactForm fields={[
  { id: "username", type: "text", label: "Username" },
  { id: "email", type: "email", label: "Email" },
  { id: "password", type: "password", label: "Password" }
]} />
```

***

## AI-Managed State: The Secret Sauce

Regular React state:

```typescript
const [value, setValue] = useState("");  // Lost on page refresh
```

Tambo state:

```typescript
const [value, setValue] = useTamboComponentState("fieldValue", "");
```

**What's different?**

1. **Persisted in database** (`messages.componentState` column)
2. **Accessible to AI** (AI can read and modify it)
3. **Synced on every update**

**Example:**

```typescript
const ContactForm = ({ fields }) => {
  const [formData, setFormData] = useTamboComponentState("formData", {});

  return (
    <form>
      {fields.map(field => (
        <input
          value={formData[field.id] || ""}
          onChange={e => setFormData({
            ...formData,
            [field.id]: e.target.value
          })}
        />
      ))}
    </form>
  );
};
```

**Now the AI can:**

```
User: "What did I enter in the email field?"
AI: *reads componentState* "You entered: user@example.com"

User: "Clear the form"
AI: *updates componentState to {}* "Form cleared!"
```

***

## Tools: AI Actions

Beyond UI components, you can register action tools:

```typescript
const searchProductsTool = defineTool({
  name: "search_products",
  description: "Search the product catalog",
  tool: async ({ query }) => {
    const results = await db.products.search(query);
    return results;
  },
  inputSchema: z.object({
    query: z.string()
  }),
  outputSchema: z.array(z.object({
    id: z.string(),
    name: z.string(),
    price: z.number()
  }))
});

<TamboProvider tools={[searchProductsTool]}>
  <App />
</TamboProvider>
```

**How it works:**

```
User: "Show me laptops under $1000"

LLM: Calls search_products({ query: "laptops under 1000" })
     ↓
Backend: Executes tool function, gets results
     ↓
Backend: Adds tool result to thread, calls LLM again
     ↓
LLM: Sees results, decides to render ProductList component
     ↓
User: Sees interactive product list
```

**This is the recursive loop:**

```
User message → LLM → Tool call → Execute → Add result → LLM again → Component
```

***

## MCP: Infinite Extensibility

MCP (Model Context Protocol) lets you connect external tools without writing integration code.

### Configure MCP Server (via UI or API)

```json
{
  "type": "MCP",
  "serverKey": "github",
  "url": "https://github-mcp-server.com",
  "transport": "HTTP"
}
```

### What Happens Automatically

1. **Tool Discovery:**

```typescript
// Backend calls MCP server
const tools = await mcpClient.listTools();
// Returns: [
//   { name: "create_issue", description: "Create a GitHub issue", ... },
//   { name: "list_prs", description: "List pull requests", ... }
// ]
```

2. **Tool Registration:**

```typescript
// Backend prefixes with serverKey to avoid conflicts
"create_issue" → "github:create_issue"
"list_prs" → "github:list_prs"
```

3. **LLM Sees Tools:**

```
Available tools:
- ui_ContactForm
- ui_ProductList
- github:create_issue  ← From MCP!
- github:list_prs      ← From MCP!
- search_products
```

4. **Tool Execution:**

```
User: "Create a GitHub issue for this bug"

LLM: Calls github:create_issue({ title: "Bug report", ... })
     ↓
Backend: Unprefixes: "create_issue"
Backend: Calls MCP server: mcpClient.callTool("create_issue", params)
     ↓
GitHub MCP: Creates actual GitHub issue
     ↓
Backend: Returns result to LLM
     ↓
LLM: "I created issue #123 at github.com/..."
```

**Zero integration code needed!**

***

## Data Flow Diagram

```
┌─────────────┐
│    USER     │
│  types msg  │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────────┐
│      React App                  │
│  useTamboThread()               │
│  sendThreadMessage("msg")       │
└──────┬──────────────────────────┘
       │ HTTP POST
       ▼
┌─────────────────────────────────┐
│   NestJS API                    │
│   POST /threads/:id/advancestream│
│   (SSE headers)                 │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   ThreadsService                │
│   1. Save user message to DB    │
│   2. Get thread history         │
│   3. Fetch tools (MCP + Client) │
│   4. Call TamboBackend          │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   TamboBackend                  │
│   Decision Loop:                │
│   1. Build prompt with tools    │
│   2. Call LLM (streaming)       │
│   3. Parse responses            │
└──────┬──────────────────────────┘
       │ Streaming chunks
       ▼
┌─────────────────────────────────┐
│   OpenAI / Anthropic            │
│   Returns tool call:            │
│   ui_ContactForm({fields:[...]})│
└──────┬──────────────────────────┘
       │ Streaming JSON
       ▼
┌─────────────────────────────────┐
│   Decision Loop                 │
│   for await (chunk) {           │
│     parse(chunk.arguments)      │
│     yield { props: ... }        │
│   }                             │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   ThreadsService                │
│   1. Save to DB                 │
│   2. Push to SSE queue          │
└──────┬──────────────────────────┘
       │ SSE events
       ▼
┌─────────────────────────────────┐
│   NestJS Controller             │
│   response.write(                │
│     `data: ${JSON.stringify(    │
│       chunk                      │
│     )}\n\n`                      │
│   )                             │
└──────┬──────────────────────────┘
       │ text/event-stream
       ▼
┌─────────────────────────────────┐
│   React SDK                     │
│   1. Receive SSE event          │
│   2. parse(props)               │
│   3. validate(schema)           │
│   4. React.createElement()      │
│   5. setState(component)        │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────────────────────────┐
│   React App                     │
│   Re-renders with component     │
└──────┬──────────────────────────┘
       │
       ▼
┌─────────────┐
│    USER     │
│ sees result │
└─────────────┘
```

***

## Quick Reference

### Frontend Hooks

```typescript
// Thread management
const { sendThreadMessage, thread } = useTamboThread();

// User input
const { input, setInput, submit } = useTamboThreadInput();

// Component state (AI-accessible)
const [value, setValue] = useTamboComponentState("key", initialValue);

// Stream status
const { streamStatus, propStatus } = useTamboStreamStatus();

// Current message context
const message = useTamboCurrentMessage();
```

### Component Registration

```typescript
<TamboProvider
  components={[
    {
      name: "ComponentName",
      description: "Clear description for AI",
      component: YourComponent,
      propsSchema: z.object({ /* schema */ })
    }
  ]}
  tools={[
    {
      name: "tool_name",
      description: "What this tool does",
      tool: async (params) => { /* implementation */ },
      inputSchema: z.object({ /* params */ }),
      outputSchema: z.object({ /* result */ })
    }
  ]}
>
  <App />
</TamboProvider>
```

### Generation Stages

```typescript
GenerationStage.IDLE              // Ready for input
GenerationStage.CHOOSING_COMPONENT // AI selecting component
GenerationStage.FETCHING_CONTEXT  // Calling tools for data
GenerationStage.HYDRATING_COMPONENT // Preparing props
GenerationStage.STREAMING_RESPONSE // Streaming props
GenerationStage.COMPLETE          // Done
```

***

## Common Patterns

### Pattern 1: Form with Validation

```typescript
const ValidatedForm = ({ fields, validationRules }) => {
  const [data, setData] = useTamboComponentState("formData", {});
  const [errors, setErrors] = useTamboComponentState("errors", {});

  const validate = (fieldId, value) => {
    const rule = validationRules[fieldId];
    if (rule?.required && !value) {
      return "This field is required";
    }
    if (rule?.pattern && !new RegExp(rule.pattern).test(value)) {
      return "Invalid format";
    }
    return null;
  };

  return (
    <form>
      {fields.map(field => (
        <div key={field.id}>
          <input
            value={data[field.id] || ""}
            onChange={e => {
              const error = validate(field.id, e.target.value);
              setData({ ...data, [field.id]: e.target.value });
              setErrors({ ...errors, [field.id]: error });
            }}
          />
          {errors[field.id] && <span>{errors[field.id]}</span>}
        </div>
      ))}
    </form>
  );
};
```

### Pattern 2: Loading States

```typescript
const DataDisplay = ({ dataSource }) => {
  const { streamStatus } = useTamboStreamStatus();

  if (streamStatus.isPending) {
    return <Skeleton />;
  }

  if (streamStatus.isStreaming) {
    return (
      <div className="opacity-50">
        {/* Show partial data */}
        {dataSource?.map(item => <Item key={item.id} {...item} />)}
      </div>
    );
  }

  return (
    <div>
      {dataSource.map(item => <Item key={item.id} {...item} />)}
    </div>
  );
};
```

### Pattern 3: Tool + Component Flow

```typescript
// 1. Register tool
const fetchUserDataTool = defineTool({
  name: "fetch_user_data",
  description: "Fetch user profile data",
  tool: async ({ userId }) => {
    return await db.users.findById(userId);
  },
  inputSchema: z.object({ userId: z.string() }),
  outputSchema: userSchema
});

// 2. Register component that displays the data
const UserProfile = ({ user }) => {
  return (
    <div>
      <h1>{user.name}</h1>
      <p>{user.email}</p>
      <img src={user.avatar} />
    </div>
  );
};

// 3. User interaction
// User: "Show me user 123's profile"
//   → LLM calls fetch_user_data({ userId: "123" })
//   → Backend executes, returns user data
//   → LLM sees user data, calls ui_UserProfile({ user: {...} })
//   → Component renders
```

***

## Debugging Tips

### 1. Watch the Network Tab

Look for:

* `POST /threads/:id/advancestream` - The main streaming endpoint
* SSE events in the EventStream tab
* Each `data:` line is a chunk

### 2. Check Generation Stage

```typescript
const { thread } = useTamboThread();
console.log("Current stage:", thread.generationStage);
console.log("Status:", thread.statusMessage);
```

### 3. Inspect Component State

```typescript
const message = useTamboCurrentMessage();
console.log("Component state:", message.componentState);
console.log("Component props:", message.component?.props);
```

### 4. Validate Schemas

If props aren't validating:

```typescript
// Test your schema
const result = yourSchema.safeParse(props);
if (!result.success) {
  console.error("Schema errors:", result.error.errors);
}
```

### 5. Check Backend Logs

Look for:

* Tool call requests
* MCP server connections
* Schema validation errors
* LLM API errors

***

## Performance Tips

### 1. Optimize Schemas

**Bad:**

```typescript
z.object({
  data: z.any()  // LLM doesn't know what to generate
})
```

**Good:**

```typescript
z.object({
  data: z.array(z.object({
    id: z.string(),
    name: z.string()
  }))  // LLM knows exact structure
})
```

### 2. Use Loading Components

```typescript
{
  name: "DataTable",
  component: DataTable,
  loadingComponent: DataTableSkeleton,  // Shows while streaming
  propsSchema: tableSchema
}
```

### 3. Debounce State Updates

```typescript
const [value, setValue] = useTamboComponentState("text", "");

const debouncedSetValue = useMemo(
  () => debounce(setValue, 300),
  [setValue]
);

<input onChange={e => debouncedSetValue(e.target.value)} />
```

### 4. Memoize Expensive Renders

```typescript
const ExpensiveComponent = memo(({ data }) => {
  // Only re-renders when data changes
  return <ComplexVisualization data={data} />;
});
```

***

## Summary

**The magic is simple:**

1. **Components = Tools** - React components are registered as LLM tools with schemas
2. **Streaming = Progressive** - Props stream in, components render progressively
3. **State = Shared** - AI and React share the same state
4. **Tools = Actions** - AI can fetch data, perform actions, then render results
5. **MCP = Plugins** - External tools plug in without code changes

**That's generative UI.**

The AI doesn't just talk about what should be built - it builds it, in real-time, tailored to the user's exact needs.

***

## Next Steps

1. **Try it:** `npm create tambo-app`

2. **Read the code:**
   * `react-sdk/src/providers/tambo-provider.tsx` - Provider setup
   * `react-sdk/src/util/generate-component.ts` - Component rendering
   * `apps/api/src/threads/threads.service.ts` - Backend orchestration
   * `packages/backend/src/services/decision-loop/` - The decision loop

3. **Build a component:**
   * Define schema with Zod
   * Register with TamboProvider
   * Test with: "Create a \[your component]"

4. **Add a tool:**
   * Write async function
   * Define input/output schemas
   * Register with TamboProvider
   * Test with: "Use \[your tool] to..."

5. **Connect MCP server:**
   * Find or build MCP server
   * Configure in Tambo Cloud
   * Tools auto-register
   * Test: "\[MCP tool action]"

**Questions?** The full architecture report has all the deep details.
