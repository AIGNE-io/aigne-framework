import {
  type ExecutionState,
  type PlannerInput,
  type PlannerOutput,
  plannerInputSchema,
  plannerOutputSchema,
  type WorkerInput,
  type WorkerOutput,
  workerInputSchema,
} from "../type.js";

export interface TodoPlanState extends ExecutionState {}

export interface TodoPlannerInput extends PlannerInput {
  executionState: TodoPlanState;
}

export const todoPlannerInputSchema = plannerInputSchema;

export interface TodoPlannerOutput extends PlannerOutput {}

export const todoPlannerOutputSchema = plannerOutputSchema;

export interface TodoWorkerInput extends WorkerInput {
  executionState: TodoPlanState;
}

export const todoWorkerInputSchema = workerInputSchema;

export interface TodoWorkerOutput extends WorkerOutput {}
