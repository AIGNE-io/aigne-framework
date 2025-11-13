# @aigne/afs-user-profile-memory

**@aigne/afs-user-profile-memory** is an AFS module that automatically extracts and maintains structured user profile information from conversations. It enables AI agents to build and maintain long-term memory about users across sessions.

## Overview

UserProfileMemory listens to conversation history and intelligently extracts user information such as name, location, interests, family members, and projects. It stores this information in a structured JSON format and makes it available to agents through the AFS interface.

## Features

- **Automatic Extraction**: Learns about users from natural conversations
- **Structured Data**: Maintains profiles using a well-defined schema
- **Incremental Updates**: Uses JSON Patch operations for efficient updates
- **AI-Powered**: Uses AI to intelligently extract relevant information
- **Schema Validation**: Ensures profile data consistency with Zod schemas
- **Agent Integration**: Automatically injects relevant profile data into agent prompts
- **Event-Driven**: Listens to conversation history events
- **Persistent Storage**: Stores profiles in AFS storage layer

## Installation

```bash
npm install @aigne/afs-user-profile-memory @aigne/afs @aigne/core
# or
yarn add @aigne/afs-user-profile-memory @aigne/afs @aigne/core
# or
pnpm add @aigne/afs-user-profile-memory @aigne/afs @aigne/core
```

## Quick Start

```typescript
import { AIGNE, AIAgent } from "@aigne/core";
import { AFS, AFSHistory } from "@aigne/afs";
import { UserProfileMemory } from "@aigne/afs-user-profile-memory";
import { OpenAIChatModel } from "@aigne/openai";

// Setup AIGNE
const aigne = new AIGNE({
  model: new OpenAIChatModel({ apiKey: process.env.OPENAI_API_KEY })
});

// Create AFS
const afs = new AFS();

// Mount history module (required for UserProfileMemory)
afs.mount(new AFSHistory({
  storage: { url: "file:./memory.sqlite3" }
}));

// Mount UserProfileMemory
afs.mount(new UserProfileMemory({
  context: aigne.newContext()
}));
// Accessible at /modules/user-profile-memory

// Create agent
const agent = AIAgent.from({
  name: "assistant",
  instructions: "You are a helpful assistant that remembers user information",
  afs
});

// Have a conversation - profile is automatically built
const context = aigne.newContext();
await context.invoke(agent, {
  message: "Hi! I'm John, I live in San Francisco and I love hiking."
});

// The profile is automatically extracted and stored at /modules/user-profile-memory
const { result } = await afs.read('/modules/user-profile-memory');
console.log(result.content);
// {
//   name: [{ name: "John" }],
//   location: [{ city: "San Francisco" }],
//   interests: [{ content: "hiking" }]
// }
```

## How It Works

1. **Event Listening**: UserProfileMemory listens to `agentSucceed` events from AFS
2. **AI Extraction**: When an agent succeeds, it uses an AI agent to extract user information
3. **JSON Patch Operations**: The AI generates JSON Patch operations to update the profile
4. **Profile Update**: Operations are applied to the existing profile incrementally
5. **Storage**: Updated profile is stored at `/modules/user-profile-memory`

## Profile Schema

The user profile follows this structure:

```typescript
interface UserProfile {
  name?: Array<{
    name: string;
    remark?: string;
  }>;

  gender?: string;

  birthday?: string;

  languages?: Array<{
    language: string;
    remark?: string;
  }>;

  location?: Array<{
    country?: string;
    city?: string;
    address?: string;
    remark?: string;
  }>;

  interests?: Array<{
    content: string;
    remark?: string;
  }>;

  family?: Array<{
    member: string;
    relation?: string;
    remark?: string;
  }>;

  projects?: Array<{
    name: string;
    remark?: string;
  }>;
}
```

### Example Profile

```json
{
  "name": [
    { "name": "John Smith", "remark": "Prefers to be called John" }
  ],
  "gender": "male",
  "birthday": "1990-05-15",
  "languages": [
    { "language": "English", "remark": "Native" },
    { "language": "Spanish", "remark": "Intermediate" }
  ],
  "location": [
    {
      "country": "USA",
      "city": "San Francisco",
      "remark": "Moved here in 2020"
    }
  ],
  "interests": [
    { "content": "hiking", "remark": "Goes every weekend" },
    { "content": "photography" },
    { "content": "cooking" }
  ],
  "family": [
    { "member": "Sarah", "relation": "wife" },
    { "member": "Emma", "relation": "daughter", "remark": "5 years old" }
  ],
  "projects": [
    { "name": "Personal blog", "remark": "Tech and photography" },
    { "name": "Open source contributions" }
  ]
}
```

## API Reference

### Constructor

```typescript
new UserProfileMemory(options: { context: Context })
```

**Options:**
- `context`: An AIGNE context for making AI calls

### Methods

#### updateProfile(entry: AFSEntry)

Manually trigger profile update from a conversation entry:

```typescript
await userProfileMemory.updateProfile(conversationEntry);
```

#### search(path, query, options?)

Search returns the current profile:

```typescript
const { list } = await afs.search('/modules/user-profile-memory', 'any query');
// Returns array with current profile entry
```

## Incremental Updates with JSON Patch

UserProfileMemory uses [JSON Patch (RFC 6902)](http://jsonpatch.com/) for efficient incremental updates:

```typescript
// Example patch operations generated by the AI:
[
  {
    op: "add",
    path: "/interests/0",
    value: { content: "hiking" }
  },
  {
    op: "replace",
    path: "/location/0/city",
    value: "San Francisco"
  },
  {
    op: "remove",
    path: "/projects/2"
  }
]
```

This approach:
- Efficiently updates only changed fields
- Preserves existing data
- Enables complex operations (add, remove, replace)
- Reduces token usage by not regenerating entire profile

## Integration with AI Agents

UserProfileMemory automatically integrates with AIGNE agents:

```typescript
const agent = AIAgent.from({
  name: "personal-assistant",
  instructions: `You are a personal assistant that remembers user preferences.
  Use the user profile information to personalize your responses.`,
  afs: afs
});

// The agent can access the profile using afs_read tool
const result = await context.invoke(agent, {
  message: "What do you know about me?"
});
```

Agents automatically have access to these tools:
- **afs_read**: Read the user profile
- **afs_search**: Search for profile information

## Event System

UserProfileMemory hooks into the AFS event system:

```typescript
// UserProfileMemory listens to this event internally
afs.on('agentSucceed', async ({ input, output }) => {
  // Automatically updates profile from new conversation
});

// You can also listen to profile updates if needed
// (requires custom implementation)
```

## Examples

- [AFS Memory Example](../../examples/afs-memory/README.md) - Conversational memory with user profiles
- [AFS LocalFS Example](../../examples/afs-local-fs/README.md) - File system access with AI agents
- [AFS MCP Server Example](../../examples/afs-mcp-server/README.md) - Mount MCP servers as AFS modules

## Error Handling

```typescript
try {
  const { result } = await afs.read('/modules/user-profile-memory');
  if (!result) {
    console.log('No profile found yet');
  }
} catch (error) {
  console.error('Failed to read profile:', error);
}
```

## TypeScript Support

This package includes full TypeScript type definitions:

```typescript
import type { UserProfileMemory } from "@aigne/afs-user-profile-memory";
import type { userProfileSchema } from "@aigne/afs-user-profile-memory/schema";
import type { z } from "zod";

type UserProfile = z.infer<typeof userProfileSchema>;
```

## Dependencies

- `@aigne/afs` - AFS core functionality
- `@aigne/core` - AIGNE framework
- `fast-json-patch` - JSON Patch operations
- `zod` - Schema validation
- `zod-to-json-schema` - Convert Zod schemas to JSON Schema

## Related Packages

- [@aigne/afs](../core/README.md) - AFS core package
- [@aigne/afs-local-fs](../local-fs/README.md) - File system module

## License

[Elastic-2.0](../../LICENSE.md)
