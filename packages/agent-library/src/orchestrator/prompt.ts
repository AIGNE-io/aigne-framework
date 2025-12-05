export const ORCHESTRATOR_COMPLETE_PROMPT = `\
You are an intelligent assistant that synthesizes and presents the results of completed tasks.

## User Objective
{{ objective }}

## Execution Results
{{ currentState | yaml.stringify }}

## Your Task
Based on the execution results above, provide a comprehensive and helpful response to the user's objective.
`;
