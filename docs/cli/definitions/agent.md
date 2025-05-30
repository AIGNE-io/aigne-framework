# Creating AI Agents - Making Intelligence Accessible

**English** | [中文](agent.zh.md)

Want to have your own AI assistant? Using AIGNE's YAML configuration approach, you can create powerful AI agents in just a few minutes! No complex programming knowledge required - it's as simple as filling out a form.

## Basic Structure - Building Your AI Assistant Blueprint

```yaml
name: chat
description: Chat agent
instructions: |
  You are a helpful assistant that can answer questions and provide information on a wide range of topics.
  Your goal is to assist users in finding the information they need and to engage in friendly conversation.
input_schema:
  type: object
  properties:
    message:
      type: string
      description: User message
  required:
    - "message"
output_schema:
  type: object
  properties:
    response:
      type: string
      description: AI response
  required:
    - "response"
output_key: text
skills:
  - plus.js
```

## Configuration Options Explained - The Secret Behind Each Parameter

* `name`: Unique identifier for the agent, like giving your AI assistant a name
* `description`: Brief description of the agent's functionality and purpose, so others know what it can do at a glance
* `instructions`: Detailed instructions guiding the agent's behavior (using YAML's multi-line text format), this is the AI's "personality setting"
* `input_schema`: \[Optional] JSON Schema definition for input parameters, defining what kind of data the AI receives
  * `type`: Input data type (top level must be `object`)
  * `properties`: Detailed definition of input parameters, like designing form fields
  * `required`: List of parameters that must be provided, ensuring key information isn't missed
* `output_schema`: \[Optional] JSON Schema definition for output results (only use when structured data output is needed)
  * `type`: Output data type (top level must be `object`)
  * `properties`: Detailed definition of output results, letting AI know what format to return
  * `required`: List of parameters that must be returned, ensuring output completeness
* `output_key`: \[Optional] Key name for output text (defaults to `$message`, only effective when there's no `output_schema`)
* `skills`: \[Optional] List of tools the agent can use (JavaScript files implementing specific functions), equipping your AI with superpowers
* `memory`: \[Optional] Enable the agent's conversation memory feature, letting AI remember your conversation history. Can be:
  * Boolean value (`true` to enable, `false` to disable)
  * Object containing configuration options:
    * `subscribe_topic`: Array of memory topics the agent should subscribe to

***

**Congratulations!** Through the above configuration, you've mastered the core skills of creating AIGNE agents. Now you can:

✅ Create AI assistants with different personalities
✅ Equip AI with various skills and tools
✅ Give AI memory and learning capabilities
✅ Seamlessly integrate with other systems and resources

**Pro Tip:** Start with a simple chatbot and gradually add more features - you'll discover the infinite possibilities of AI agents!
