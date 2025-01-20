import {
  LLMModel,
  type LLMModelInputs,
  type LLMModelOutputs,
  type RunnableResponse,
  type RunnableResponseChunk,
} from "../../src";

export class MockLLMModel extends LLMModel {
  process(
    _input: LLMModelInputs,
  ):
    | AsyncGenerator<RunnableResponseChunk<LLMModelOutputs>, void, void>
    | Promise<
        | AsyncGenerator<RunnableResponseChunk<LLMModelOutputs>, void, void>
        | RunnableResponse<LLMModelOutputs>
      > {
    throw new Error("Method not implemented.");
  }
}
