import {nanoid} from 'nanoid'
import {inject, injectable} from 'tsyringe'

import {Agent, type AgentProcessOptions} from './agent'
import {TYPES} from './constants'
import type {Context, ContextState} from './context'
import type {DataTypeSchema} from './definitions/data-type-schema'
import {type CreateRunnableMemory, toRunnableMemories} from './definitions/memory'
import type {CreateLLMAgentOptions, LLMAgentDefinition} from './llm-agent'
import type {LLMModel, LLMModelInputs} from './llm-model'
import type {MemorableSearchOutput, MemoryItemWithScore} from './memorable'
import type {Runnable, RunnableDefinition} from './runnable'
import {OrderedRecord, extractOutputsFromRunnableOutput, renderMessage} from './utils'
import {prepareMessages} from './utils/message-utils'
import type {ExtractRunnableInputType, ExtractRunnableOutputType} from './utils/runnable-type'
import type {UnionToIntersection} from './utils/union'

@injectable()
export class LLMDecisionAgent<
  I extends {[name: string]: any} = {},
  O extends {[name: string]: any} = {},
  Memories extends {[name: string]: MemoryItemWithScore[]} = {},
  State extends ContextState = ContextState,
> extends Agent<I, O, Memories, State> {
  static create = create

  constructor(
    @inject(TYPES.definition)
    public override definition: LLMDecisionAgentDefinition,
    @inject(TYPES.context) context?: Context<State>,
    @inject(TYPES.llmModel) public model?: LLMModel
  ) {
    super(definition, context)

    this.model ??= context?.resolveDependency(TYPES.llmModel)
  }

  async process(input: I, options: AgentProcessOptions<Memories>) {
    const {definition, context, model} = this
    if (!model) throw new Error('LLM model is required')
    if (!context) throw new Error('Context is required')

    const {originalMessages, messagesWithMemory} = prepareMessages(
      definition,
      input,
      options.memories
    )

    const cases = await Promise.all(
      OrderedRecord.map(definition.cases, async t => {
        if (!t.runnable?.id) throw new Error('Runnable is required')

        const runnable = await context.resolve<Runnable<I, O>>(t.runnable.id)

        // TODO: auto generate name by llm model if needed
        const name = t.name || runnable.name
        if (!name) throw new Error('Case name is required')

        return {name, description: t.description, runnable}
      })
    )

    const llmInputs: LLMModelInputs = {
      messages: messagesWithMemory,
      modelOptions: definition.modelOptions,
      tools: cases.map(t => {
        // TODO: auto generate parameters by llm model if needed
        return {
          type: 'function',
          function: {
            name: t.name,
            description: t.description,
            parameters: {},
          },
        }
      }),
      toolChoice: 'required',
    }

    const {toolCalls} = await model.run(llmInputs)

    // TODO: support run multiple calls

    const functionNameToCall = toolCalls?.[0]?.function?.name
    if (!functionNameToCall) throw new Error('No any runnable called')

    const caseToCall = cases.find(i => i.name === functionNameToCall)
    if (!caseToCall) throw new Error('Case not found')

    // TODO: check result structure and omit undefined values
    const output = await caseToCall.runnable.run(input, {stream: true})

    return extractOutputsFromRunnableOutput(output, ({$text, ...json}) =>
      this.updateMemories([
        ...originalMessages,
        {
          role: 'assistant',
          content: renderMessage('{{$text}}\n{{json}}', {$text, json}).trim(),
        },
      ])
    )
  }
}

export interface DecisionAgentCaseParameter<R extends Runnable = Runnable> {
  description?: string

  runnable: R
}

/**
 * Options to create LLMDecisionAgent.
 */
export interface CreateLLMDecisionAgentOptions<
  Case extends DecisionAgentCaseParameter,
  I extends UnionToIntersection<
    ExtractRunnableInputType<Case['runnable']>,
    {[name: string]: DataTypeSchema}
  >,
  O extends UnionToIntersection<
    ExtractRunnableOutputType<Case['runnable']>,
    {[name: string]: DataTypeSchema}
  >,
  Memories extends {[name: string]: CreateRunnableMemory<I>},
  State extends ContextState,
> extends Pick<
    CreateLLMAgentOptions<I, O, Memories, State>,
    'name' | 'memories' | 'messages' | 'modelOptions'
  > {
  context: Context<State>

  cases: {[name: string]: Case}
}

function create<
  Case extends DecisionAgentCaseParameter,
  I extends UnionToIntersection<
    ExtractRunnableInputType<Case['runnable']>,
    {[name: string]: DataTypeSchema}
  >,
  O extends UnionToIntersection<
    ExtractRunnableOutputType<Case['runnable']>,
    {[name: string]: DataTypeSchema}
  >,
  Memories extends {
    [name: string]: CreateRunnableMemory<I> & {
      /**
       * Whether this memory is primary? Primary memory will be passed as messages to LLM chat model,
       * otherwise, it will be placed in a system message.
       *
       * Only one primary memory is allowed.
       */
      primary?: boolean
    }
  },
  State extends ContextState,
>({
  context,
  ...options
}: CreateLLMDecisionAgentOptions<Case, I, O, Memories, State>): LLMDecisionAgent<
  UnionToIntersection<ExtractRunnableInputType<Case['runnable']>, {}>,
  ExtractRunnableOutputType<Case['runnable']>,
  {[name in keyof Memories]: MemorableSearchOutput<Memories[name]['memory']>},
  State
> {
  const agentId = options.name || nanoid()

  const cases: OrderedRecord<LLMDecisionCase> = OrderedRecord.fromArray(
    Object.entries(options.cases).map(([name, c]) => ({
      id: nanoid(),
      name: name || c.runnable.name,
      description: c.description,
      runnable: {id: c.runnable.id},
    }))
  )

  const inputs = OrderedRecord.merge(
    ...Object.values(options.cases).map(i => i.runnable.definition.inputs)
  )

  const outputs = OrderedRecord.fromArray(
    OrderedRecord.map(
      OrderedRecord.merge(...Object.values(options.cases).map(i => i.runnable.definition.outputs)),
      o => ({...o, required: false})
    )
  )

  const memories = toRunnableMemories(agentId, inputs, options.memories ?? {})
  const primaryMemoryNames = Object.entries(options.memories ?? {})
    .filter(([, i]) => i.primary)
    .map(([name]) => name)

  if (primaryMemoryNames && primaryMemoryNames.length > 1) {
    throw new Error('Only one primary memory is allowed')
  }

  const messages = OrderedRecord.fromArray(
    options.messages?.map(i => ({
      id: nanoid(),
      role: i.role,
      content: i.content,
    }))
  )

  return new LLMDecisionAgent(
    {
      id: agentId,
      name: options.name,
      type: 'llm_decision_agent',
      inputs,
      outputs,
      messages,
      primaryMemoryId: primaryMemoryNames?.at(0),
      memories,
      modelOptions: options.modelOptions,
      cases,
    },
    context
  )
}

export interface LLMDecisionAgentDefinition
  extends RunnableDefinition,
    Pick<LLMAgentDefinition, 'modelOptions' | 'messages' | 'primaryMemoryId'> {
  type: 'llm_decision_agent'

  cases?: OrderedRecord<LLMDecisionCase>
}

export interface LLMDecisionCase {
  id: string

  name?: string

  description?: string

  runnable?: {
    id?: string
  }
}
