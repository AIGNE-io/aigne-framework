import debug, { type Debugger } from "debug";
import type { Ora } from "ora";

interface DebugWithSpinner extends Debugger {
  spinner<T>(
    promise: Promise<T>,
    message?: string,
    callback?: (result: T) => void,
    options?: { disabled?: boolean },
  ): Promise<T>;
  extend: (namespace: string) => DebugWithSpinner;
}

debug.log = (...args) => {
  const { isSpinning } = globalSpinner ?? {};
  if (isSpinning) globalSpinner?.stop();
  console.log(...args);
  if (isSpinning) globalSpinner?.start();
};

function createDebugger(namespace: string): DebugWithSpinner {
  const i = debug(namespace) as DebugWithSpinner;

  function overrideExtend(debug: DebugWithSpinner) {
    const originalExtend = debug.extend;
    debug.extend = (namespace: string) => {
      const extended = originalExtend.call(debug, namespace);
      overrideExtend(extended);

      extended.spinner = async <T>(
        promise: Promise<T>,
        message?: string,
        callback?: (result: T) => void,
        options?: { disabled?: boolean },
      ) => {
        if (!extended.enabled || options?.disabled) return promise;

        return spinner(promise, message, callback);
      };

      return extended;
    };
  }

  overrideExtend(i);

  return i;
}

let globalSpinner: Ora | undefined;

interface SpinnerTask<T = unknown> {
  promise: Promise<T>;
  message?: string;
  callback?: (result: T) => void;
  status?: "fail" | "succeed";
  result?: T;
}

const globalSpinnerTasks: SpinnerTask[] = [];

async function spinner<T>(
  promise: Promise<T>,
  message?: string,
  callback?: (result: T) => void,
): Promise<T> {
  const task: SpinnerTask<T> = { promise, message, callback };
  globalSpinnerTasks.push(task as SpinnerTask);

  globalSpinner?.start(message || " ");

  await promise
    .then((result) => {
      task.result = result;
      task.status = "succeed";
    })
    .catch(() => {
      task.status = "fail";
    });

  // Once the promise resolves or rejects, it updates the spinner status and processes
  // all completed tasks in a Last-In-First-Out (LIFO) order.
  for (;;) {
    const task = globalSpinnerTasks.at(-1);
    if (!task) break;

    // Recover spinner state for last running task
    if (!task.status) {
      globalSpinner?.start(task.message || " ");
      break;
    }

    globalSpinnerTasks.pop();

    if (task.message) {
      if (task.status === "fail") globalSpinner?.fail(task.message);
      else globalSpinner?.succeed(task.message);
    } else {
      globalSpinner?.stop();
    }

    // NOTE: This is a workaround to make sure the spinner stops spinning before the next tick
    await new Promise((resolve) => setTimeout(resolve, 10));

    if (task.status === "succeed") task.callback?.(task.result);
  }

  return promise;
}

const base = createDebugger("aigne");

export const logger = Object.assign(debug, {
  globalSpinner,
  base,
  debug: base.extend("core"),
  spinner,
  setSpinner: (spinner: Ora) => {
    globalSpinner = spinner;
    logger.globalSpinner = spinner;
  },
});
