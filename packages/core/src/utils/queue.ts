/** biome-ignore-all lint/style/noNonNullAssertion lint/complexity/useOptionalChain: <!> */
// Cross-platform queue implementation compatible with Node.js and browser
// Based on fastqueue library but implemented in TypeScript

interface Task<T, R> {
  value: T | null;
  callback: (err: any, result?: R) => void;
  next: Task<T, R> | null;
  release: (holder?: Task<T, R>) => void;
  context: any;
  errorHandler: ((err: any, value: T) => void) | null;
  worked: (err: any, result?: R) => void;
}

interface ObjectPool<T> {
  get(): T;
  release(obj: T): void;
}

declare namespace fastq {
  type worker<C, T = any, R = any> = (this: C, task: T, cb: fastq.done<R>) => void;
  type asyncWorker<C, T = any, R = any> = (this: C, task: T) => Promise<R>;
  type done<R = any> = (err: Error | null, result?: R) => void;
  type errorHandler<T = any> = (err: Error, task: T) => void;

  interface queue<T = any, R = any> {
    /** Add a task at the end of the queue. `done(err, result)` will be called when the task was processed. */
    push(task: T, done?: done<R>): void;
    /** Add a task at the beginning of the queue. `done(err, result)` will be called when the task was processed. */
    unshift(task: T, done?: done<R>): void;
    /** Pause the processing of tasks. Currently worked tasks are not stopped. */
    pause(): any;
    /** Resume the processing of tasks. */
    resume(): any;
    running(): number;
    /** Returns `false` if there are tasks being processed or waiting to be processed. `true` otherwise. */
    idle(): boolean;
    /** Returns the number of tasks waiting to be processed (in the queue). */
    length(): number;
    /** Returns all the tasks be processed (in the queue). Returns empty array when there are no tasks */
    getQueue(): T[];
    /** Removes all tasks waiting to be processed, and reset `drain` to an empty function. */
    kill(): any;
    /** Same than `kill` but the `drain` function will be called before reset to empty. */
    killAndDrain(): any;
    /** Set a global error handler. `handler(err, task)` will be called each time a task is completed, `err` will be not null if the task has thrown an error. */
    error(handler: errorHandler<T>): void;
    /** Property that returns the number of concurrent tasks that could be executed in parallel. It can be altered at runtime. */
    concurrency: number;
    /** Property that returns `true` when the queue is in a paused state. */
    paused: boolean;
    /** Function that will be called when the last item from the queue has been processed by a worker. It can be altered at runtime. */
    drain(): any;
    /** Function that will be called when the last item from the queue has been assigned to a worker. It can be altered at runtime. */
    empty: () => void;
    /** Function that will be called when the queue hits the concurrency limit. It can be altered at runtime. */
    saturated: () => void;
  }

  interface queueAsPromised<T = any, R = any> extends queue<T, R> {
    /** Add a task at the end of the queue. The returned `Promise` will be fulfilled (rejected) when the task is completed successfully (unsuccessfully). */
    push(task: T): Promise<R>;
    /** Add a task at the beginning of the queue. The returned `Promise` will be fulfilled (rejected) when the task is completed successfully (unsuccessfully). */
    unshift(task: T): Promise<R>;
    /** Wait for the queue to be drained. The returned `Promise` will be resolved when all tasks in the queue have been processed by a worker. */
    drained(): Promise<void>;
  }
}

// Cross-platform nextTick implementation
const nextTick = (() => {
  if (typeof process !== "undefined" && process.nextTick) {
    return process.nextTick;
  }
  if (typeof setImmediate !== "undefined") {
    return setImmediate;
  }
  return (callback: () => void) => setTimeout(callback, 0);
})();

// Simple object pooling implementation to replace reusify
function createObjectPool<T>(factory: () => T): ObjectPool<T> {
  const pool: T[] = [];

  return {
    get(): T {
      return pool.pop() || factory();
    },
    release(obj: T): void {
      pool.push(obj);
    },
  };
}

function noop(): void {}

function createTask<T, R>(): Task<T, R> {
  const task: Task<T, R> = {
    value: null,
    callback: noop,
    next: null,
    release: noop,
    context: null,
    errorHandler: null,
    worked: function worked(err: any, result?: R): void {
      const callback = task.callback;
      const errorHandler = task.errorHandler;
      const val = task.value;
      task.value = null;
      task.callback = noop;
      if (task.errorHandler && err) {
        errorHandler!(err, val!);
      }
      callback.call(task.context, err, result);
      task.release(task);
    },
  };

  return task;
}

function fastq<C, T = any, R = any>(
  context: C,
  worker: fastq.worker<C, T, R>,
  _concurrency: number,
): fastq.queue<T, R>;
function fastq<C, T = any, R = any>(
  worker: fastq.worker<C, T, R>,
  _concurrency: number,
): fastq.queue<T, R>;
function fastq<C, T = any, R = any>(
  contextOrWorker: C | fastq.worker<C, T, R>,
  workerOrConcurrency: fastq.worker<C, T, R> | number,
  _concurrency?: number,
): fastq.queue<T, R> {
  let context: C | null = null;
  let worker: fastq.worker<C, T, R>;
  let concurrency: number;

  if (typeof contextOrWorker === "function") {
    context = null;
    worker = contextOrWorker as fastq.worker<C, T, R>;
    concurrency = workerOrConcurrency as number;
  } else {
    context = contextOrWorker;
    worker = workerOrConcurrency as fastq.worker<C, T, R>;
    concurrency = _concurrency!;
  }

  if (!(concurrency >= 1)) {
    throw new Error("fastq concurrency must be equal to or greater than 1");
  }

  const cache = createObjectPool<Task<T, R>>(() => createTask<T, R>());
  let queueHead: Task<T, R> | null = null;
  let queueTail: Task<T, R> | null = null;
  let _running = 0;
  let errorHandler: ((err: any, value: T) => void) | null = null;

  const self: fastq.queue<T, R> = {
    push,
    drain: noop,
    saturated: noop,
    pause,
    paused: false,

    get concurrency(): number {
      return concurrency;
    },

    set concurrency(value: number) {
      if (!(value >= 1)) {
        throw new Error("fastq concurrency must be equal to or greater than 1");
      }
      concurrency = value;

      if (self.paused) return;
      for (; queueHead && _running < concurrency; ) {
        _running++;
        release();
      }
    },

    running,
    resume,
    idle,
    length,
    getQueue,
    unshift,
    empty: noop,
    kill,
    killAndDrain,
    error,
  };

  return self;

  function running(): number {
    return _running;
  }

  function pause(): void {
    self.paused = true;
  }

  function length(): number {
    let current = queueHead;
    let counter = 0;

    while (current) {
      current = current.next;
      counter++;
    }

    return counter;
  }

  function getQueue(): T[] {
    let current = queueHead;
    const tasks: T[] = [];

    while (current) {
      if (current.value !== null) {
        tasks.push(current.value);
      }
      current = current.next;
    }

    return tasks;
  }

  function resume(): void {
    if (!self.paused) return;
    self.paused = false;
    for (; queueHead && _running < concurrency; ) {
      _running++;
      release();
    }
  }

  function idle(): boolean {
    return _running === 0 && self.length() === 0;
  }

  function push(value: T, done?: (err: any, result?: R) => void): void {
    const current = cache.get();

    current.context = context;
    current.release = release;
    current.value = value;
    current.callback = done || noop;
    current.errorHandler = errorHandler;

    if (_running >= concurrency || self.paused) {
      if (queueTail) {
        queueTail.next = current;
        queueTail = current;
      } else {
        queueHead = current;
        queueTail = current;
        self.saturated();
      }
    } else {
      _running++;
      worker.call(context as C, current.value!, current.worked);
    }
  }

  function unshift(value: T, done?: (err: any, result?: R) => void): void {
    const current = cache.get();

    current.context = context;
    current.release = release;
    current.value = value;
    current.callback = done || noop;
    current.errorHandler = errorHandler;

    if (_running >= concurrency || self.paused) {
      if (queueHead) {
        current.next = queueHead;
        queueHead = current;
      } else {
        queueHead = current;
        queueTail = current;
        self.saturated();
      }
    } else {
      _running++;
      worker.call(context as C, current.value!, current.worked);
    }
  }

  function release(holder?: Task<T, R>): void {
    if (holder) {
      cache.release(holder);
    }
    const next = queueHead;
    if (next) {
      if (!self.paused) {
        if (queueTail === queueHead) {
          queueTail = null;
        }
        queueHead = next.next;
        next.next = null;
        worker.call(context as C, next.value!, next.worked);
        if (queueTail === null) {
          self.empty();
        }
      } else {
        _running--;
      }
    } else if (--_running === 0) {
      self.drain();
    }
  }

  function kill(): void {
    queueHead = null;
    queueTail = null;
    self.drain = noop;
  }

  function killAndDrain(): void {
    queueHead = null;
    queueTail = null;
    self.drain();
    self.drain = noop;
  }

  function error(handler: (err: any, value: T) => void): void {
    errorHandler = handler;
  }
}

function queueAsPromised<C, T = any, R = any>(
  context: C,
  worker: fastq.asyncWorker<C, T, R>,
  _concurrency: number,
): fastq.queueAsPromised<T, R>;
function queueAsPromised<C, T = any, R = any>(
  worker: fastq.asyncWorker<C, T, R>,
  _concurrency: number,
): fastq.queueAsPromised<T, R>;
function queueAsPromised<C, T = any, R = any>(
  contextOrWorker: C | fastq.asyncWorker<C, T, R>,
  workerOrConcurrency: fastq.asyncWorker<C, T, R> | number,
  _concurrency?: number,
): fastq.queueAsPromised<T, R> {
  let context: C | null = null;
  let worker: fastq.asyncWorker<C, T, R>;
  let concurrency: number;

  if (typeof contextOrWorker === "function") {
    context = null;
    worker = contextOrWorker as fastq.asyncWorker<C, T, R>;
    concurrency = workerOrConcurrency as number;
  } else {
    context = contextOrWorker;
    worker = workerOrConcurrency as fastq.asyncWorker<C, T, R>;
    concurrency = _concurrency!;
  }

  function asyncWrapper(arg: T, cb: (err: any, result?: R) => void): void {
    worker.call(context as C, arg).then(
      (res: R) => cb(null, res),
      (err: any) => cb(err),
    );
  }

  const queue = fastq(context, asyncWrapper, concurrency);

  const pushCb = queue.push;
  const unshiftCb = queue.unshift;

  const promiseQueue: fastq.queueAsPromised<T, R> = {
    ...queue,
    push,
    unshift,
    drained,
  };

  // Make sure drain property is properly connected
  Object.defineProperty(promiseQueue, "drain", {
    get: () => queue.drain,
    set: (value) => {
      queue.drain = value;
    },
  });

  return promiseQueue;

  function push(value: T): Promise<R> {
    const p = new Promise<R>((resolve, reject) => {
      pushCb(value, (err: any, result?: R) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result!);
      });
    });

    // Fork the promise chain to prevent unhandled rejection
    p.catch(noop);

    return p;
  }

  function unshift(value: T): Promise<R> {
    const p = new Promise<R>((resolve, reject) => {
      unshiftCb(value, (err: any, result?: R) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(result!);
      });
    });

    // Fork the promise chain to prevent unhandled rejection
    p.catch(noop);

    return p;
  }

  function drained(): Promise<void> {
    return new Promise<void>((resolve) => {
      nextTick(() => {
        if (queue.idle()) {
          resolve();
        } else {
          const previousDrain = queue.drain;
          queue.drain = () => {
            if (typeof previousDrain === "function" && previousDrain !== noop) {
              previousDrain();
            }
            resolve();
            queue.drain = previousDrain;
          };
        }
      });
    });
  }
}

// Add promise function to namespace
fastq.promise = queueAsPromised;

// Modern ESM exports
export default fastq;
export const promise = queueAsPromised;
