import type { MemoryMessage } from "@aigne/core";

import { FACT_RETRIEVAL_PROMPT } from "./prompts";

export function parseMessages(messages: MemoryMessage[]): string {
	return messages.reduce((response, msg) => {
		return `${response}${msg.role}: ${msg.content}\n`;
	}, "");
}

export function getFactRetrievalMessages(messages: string): [string, string] {
	return [FACT_RETRIEVAL_PROMPT, `Input: ${messages}`];
}
