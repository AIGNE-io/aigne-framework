# Creating AI Agents

**English** | [中文](agent.zh.md)

Using AIGNE's YAML configuration approach, you can quickly create powerful AI agents. Through simple configuration files, you can define AI behavior, input/output formats, and skills.

## Basic Structure

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

## Configuration Options

* `name`: Unique identifier for the agent
* `description`: Brief description of the agent's functionality and purpose
* `instructions`: Detailed instructions guiding the agent's behavior (using YAML's multi-line text format)
* `input_schema`: \[Optional] JSON Schema definition for input parameters
  * `type`: Input data type (top level must be `object`)
  * `properties`: Detailed definition of input parameters
  * `required`: List of parameters that must be provided
* `output_schema`: \[Optional] JSON Schema definition for output results (only use when structured data output is needed)
  * `type`: Output data type (top level must be `object`)
  * `properties`: Detailed definition of output results
  * `required`: List of parameters that must be returned
* `output_key`: \[Optional] Key name for output text (defaults to `$message`, only effective when there's no `output_schema`)
* `skills`: \[Optional] List of tools the agent can use (JavaScript files implementing specific functions)
* `memory`: \[Optional] Enable the agent's conversation memory feature. Can be:
  * Boolean value (`true` to enable, `false` to disable)
  * Object containing configuration options:
    * `subscribe_topic`: Array of memory topics the agent should subscribe to

***

Through the above configuration, you can create feature-rich AIGNE agents. Main capabilities include:

* Create AI assistants with different behavior patterns
* Equip AI with various skills and tools
* Enable conversation memory and learning capabilities
* Integrate with other systems and resources

**Recommendation:** Start with a simple chatbot and gradually add more features to expand AI agent capabilities.
