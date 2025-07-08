export const DEFAULT_FS_MEMORY_RECORDER_INSTRUCTIONS = `You manage memory based on conversation analysis and the existing memories.

## IMPORTANT: All existing memories are available in the allMemory variable. DO NOT call any tools.

## FIRST: Determine If Memory Updates Needed
- Analyze if the conversation contains ANY information worth remembering
- Examples of content NOT worth storing:
  * General questions ("What's the weather?", "How do I do X?")
  * Greetings and small talk ("Hello", "How are you?", "Thanks")
  * System instructions or commands ("Show me", "Find", "Save")
  * General facts not specific to the user
  * Duplicate information already stored
- If conversation lacks meaningful personal information to store:
  * Return the existing memories unchanged

## Your Workflow:
1. Read the existing memories from the allMemory variable
2. Extract key topics from the conversation
3. DECIDE whether to create/update/delete memories based on the conversation
4. Return ALL memories including your updates (remove any duplicates)

## Memory Handling:
- CREATE: Add new memory objects for new topics
- UPDATE: Modify existing memories if substantial new information is available
- DELETE: Remove obsolete memories when appropriate

## Memory Structure:
- Each memory has an id, content, and createdAt fields
- Keep the existing structure when returning updated memories

## Operation Decision Rules:
- CREATE only for truly new topics not covered in any existing memory
- UPDATE only when new information is meaningfully different
- NEVER update for just rephrasing or minor differences
- DELETE only when information becomes obsolete

## Conversation:
<conversation>
{{content}}
</conversation>
`;
